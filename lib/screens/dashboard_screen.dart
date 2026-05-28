import 'dart:async';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../main.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/theme.dart';
import 'chat_screen.dart';
import 'order_detail_screen.dart';
import '../services/notification_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Order> _orders = [];
  List<Review> _reviews = [];
  List<Map<String, dynamic>> _services = [];
  bool _loading = true;
  bool _uploading = false;
  String? _pendingAction; // 'start' atau 'finish'
  
  UserDetails? _activeCustomer;
  List<HistoryLog> _historyLogs = [];
  Timer? _pollingTimer;

  final ImagePicker _picker = ImagePicker();

  int _getServiceDuration(String? serviceName) {
    if (serviceName == null || serviceName.isEmpty) return 120;
    
    final name = serviceName.toLowerCase().trim();
    for (final svc in _services) {
      final svcName = (svc['name'] ?? '').toString().toLowerCase().trim();
      if (name == svcName || name.contains(svcName) || svcName.contains(name)) {
        return svc['duration_minutes'] is int 
            ? svc['duration_minutes'] as int 
            : int.tryParse(svc['duration_minutes'].toString()) ?? 120;
      }
    }

    if (name.contains('ac')) {
      return 60; // 60 minutes
    }
    if (name.contains('deep')) {
      return 240; // 240 minutes (4 hours)
    }
    if (name.contains('hydro') || name.contains('sofa')) {
      return 240; // 240 minutes (4 hours)
    }
    if (name.contains('plus')) {
      return 120; // 120 minutes (2 hours)
    }
    if (name.contains('setrika') || name.contains('pakaian') || name.contains('iron')) {
      return 60; // 60 minutes (1 hour)
    }
    return 120; // Default: Basic Cleaning / others = 120 minutes (2 hours)
  }

  @override
  void initState() {
    super.initState();
    _fetchData();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) => _fetchOrdersOnly());
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final reviews = await ApiService.getReviews(workerId);
      final orders = await ApiService.getOrders();
      
      List<Map<String, dynamic>> services = [];
      try {
        services = await ApiService.getServices();
      } catch (e) {
        debugPrint('Error fetching services: $e');
      }
      
      final myOrders = orders.where((o) => o.workerId == workerId && o.status != 'cancelled').toList();

      if (mounted) {
        setState(() {
          _reviews = reviews;
          _orders = myOrders;
          _services = services;
          _loading = false;
        });
        _fetchActiveTaskDetails();
      }
    } catch (e) {
      debugPrint('Error fetching dashboard data: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _fetchOrdersOnly() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final orders = await ApiService.getOrders();
      final myOrders = orders.where((o) => o.workerId == workerId && o.status != 'cancelled').toList();

      List<Map<String, dynamic>> services = _services;
      try {
        services = await ApiService.getServices();
      } catch (e) {
        debugPrint('Error polling services: $e');
      }

      if (mounted) {
        setState(() {
          _orders = myOrders;
          _services = services;
        });
        _fetchActiveTaskDetails();
      }
      
      // Check for and trigger any new local notifications
      NotificationService.checkNewNotifications();
    } catch (e) {
      debugPrint('Error polling orders: $e');
    }
  }

  Order? get _activeTask {
    final active = _orders.where((o) => o.status != 'completed').toList();
    if (active.isEmpty) return null;
    
    active.sort((a, b) {
      if (a.status == 'in_progress' && b.status != 'in_progress') return -1;
      if (a.status != 'in_progress' && b.status == 'in_progress') return 1;
      return a.scheduledAt.compareTo(b.scheduledAt);
    });
    return active.first;
  }

  List<Order> get _upcomingTasks {
    final active = _orders.where((o) => o.status != 'completed').toList();
    if (active.isEmpty) return [];
    
    active.sort((a, b) {
      if (a.status == 'in_progress' && b.status != 'in_progress') return -1;
      if (a.status != 'in_progress' && b.status == 'in_progress') return 1;
      return a.scheduledAt.compareTo(b.scheduledAt);
    });
    return active.skip(1).toList();
  }

  Future<void> _fetchActiveTaskDetails() async {
    final task = _activeTask;
    if (task == null) {
      if (mounted) {
        setState(() {
          _activeCustomer = null;
          _historyLogs = [];
        });
      }
      return;
    }

    try {
      // Get customer details safely
      UserDetails? customer;
      try {
        customer = await ApiService.getUserDetails(task.userId);
      } catch (e) {
        debugPrint('Error fetching customer details: $e');
      }

      // Get history logs safely
      List<HistoryLog> history = [];
      try {
        history = await ApiService.getOrderHistoryLogs(task.id);
      } catch (e) {
        debugPrint('Error fetching history logs: $e');
      }
      
      if (mounted) {
        setState(() {
          if (customer != null) {
            _activeCustomer = customer;
          }
          _historyLogs = history;
        });
      }
    } catch (e) {
      debugPrint('Error fetching active task details: $e');
    }
  }

  String _getEffectiveStatus(Order task) {
    if (task.status == 'completed' || task.status == 'in_progress') {
      return task.status;
    }
    final hasArrivedLog = _historyLogs.any((log) => log.status == 'arrived');
    if (hasArrivedLog) return 'arrived';
    final hasOnTheWayLog = _historyLogs.any((log) => log.status == 'on_the_way');
    if (hasOnTheWayLog) return 'on_the_way';
    return task.status;
  }

  List<String> _getServiceDetails(String? serviceName) {
    final name = (serviceName ?? '').toLowerCase();
    if (name.contains('kamar mandi')) {
      return ['2 Kamar Mandi', 'Pembersihan kerak & noda', 'Desinfektan total'];
    }
    if (name.contains('ac')) {
      return ['Pembersihan filter & evaporator', 'Cek tekanan freon', 'Garansi cuci 14 hari'];
    }
    if (name.contains('sofa')) {
      return ['Pembersihan debu & tungau', 'Pembersihan noda & kotoran', 'Extractor washing'];
    }
    if (name.contains('setrika') || name.contains('pakaian')) {
      return ['Setrika rapi & wangi', 'Pelipatan pakaian', 'Pemisahan bahan sensitif'];
    }
    return ['Pembersihan menyeluruh', 'Pengerjaan cepat & rapi', 'Peralatan lengkap disediakan'];
  }

  Future<void> _logMicroAction(int orderId, String actionName, String note) async {
    try {
      await ApiService.addOrderHistoryLog(
        orderId: orderId,
        status: actionName,
        note: note,
      );
      
      if (actionName == 'on_the_way' || actionName == 'arrived') {
        try {
          await globalWorkerState.updateStatus('busy');
        } catch (e) {
          debugPrint('Error updating worker availability state: $e');
        }
      }

      await _fetchOrdersOnly();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Log "$note" berhasil dicatat!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mencatat log waktu')),
      );
    }
  }

  Future<void> _triggerCameraPhotoUpload(String actionType) async {
    final task = _activeTask;
    if (task == null) return;

    setState(() {
      _pendingAction = actionType;
    });

    try {
      // Pick image directly from the camera
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 70, // Optimize file size
      );

      if (image == null) {
        setState(() {
          _pendingAction = null;
        });
        return;
      }

      setState(() {
        _uploading = true;
      });

      // Upload captured camera photo
      final photoUrl = await ApiService.uploadPhoto(image.path);

      if (actionType == 'start') {
        await ApiService.updateOrderStatus(task.id, 'in_progress');
        await ApiService.addOrderHistoryLog(
          orderId: task.id,
          status: 'in_progress',
          note: 'Pekerja telah tiba dan mulai membersihkan.',
          photoUrl: photoUrl,
        );
      } else if (actionType == 'finish') {
        await ApiService.updateOrderStatus(task.id, 'completed');
        await ApiService.addOrderHistoryLog(
          orderId: task.id,
          status: 'completed',
          note: 'Pekerjaan selesai dilakukan dengan baik.',
          photoUrl: photoUrl,
        );

        try {
          await globalWorkerState.updateStatus('available');
        } catch (e) {
          debugPrint('Error updating availability state after completion: $e');
        }
      }

      await _fetchData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Berhasil memperbarui status menjadi: ${actionType == 'start' ? 'in_progress' : 'completed'}')),
      );
    } catch (e) {
      debugPrint('Photo upload/action error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengupload foto & mengupdate status')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _uploading = false;
          _pendingAction = null;
        });
      }
    }
  }

  void _callPhone(String phone) async {
    final url = Uri.parse('tel:$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _openMap(String address) async {
    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Statistics calculations for today
    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    
    // Today's orders is defined strictly based on scheduledAt date (matching React JS client)
    final todayOrders = _orders.where((o) => 
      DateFormat('yyyy-MM-dd').format(o.scheduledAt) == todayStr
    ).toList();
    
    final completedToday = todayOrders.where((o) => o.status == 'completed').toList();
    
    final earningsToday = completedToday.fold<double>(0.0, (sum, o) => sum + o.totalPrice);
    final countCompletedToday = completedToday.length;
    final countTotalToday = todayOrders.length;

    final double averageRatingVal = _reviews.isNotEmpty
        ? (_reviews.fold<double>(0.0, (sum, r) => sum + r.rating) / _reviews.length)
        : 0.0;
    final averageRating = averageRatingVal.toStringAsFixed(1);

    final totalDurationMinutes = completedToday.fold<int>(0, (sum, o) => sum + _getServiceDuration(o.serviceName));
    final hoursWorked = totalDurationMinutes / 60.0;

    final currencyFormat = NumberFormat.currency(locale: 'id-ID', symbol: 'Rp', decimalDigits: 0);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 4 Stat grid cards
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.5,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  _buildStatCard(
                    icon: Icons.credit_card,
                    iconColor: AppColors.primary,
                    bgColor: AppColors.primaryBg,
                    title: 'PENDAPATAN HARI INI',
                    value: currencyFormat.format(earningsToday),
                  ),
                  _buildStatCard(
                    icon: Icons.check_circle_outline,
                    iconColor: AppColors.secondary,
                    bgColor: const Color(0xFFE6F4F1),
                    title: 'TUGAS SELESAI',
                    value: '$countCompletedToday / $countTotalToday',
                  ),
                  _buildStatCard(
                    icon: Icons.star_border_outlined,
                    iconColor: AppColors.warning,
                    bgColor: const Color(0xFFFEF3C7),
                    title: 'RATING RATA-RATA',
                    value: averageRating,
                  ),
                  _buildStatCard(
                    icon: Icons.access_time,
                    iconColor: AppColors.danger,
                    bgColor: const Color(0xFFFEE2E2),
                    title: 'JAM KERJA HARI INI',
                    value: '$hoursWorked Jam',
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Active Task Section
              _buildActiveTaskSection(),

              const SizedBox(height: 20),

              // Upcoming Tasks
              _buildUpcomingTasksSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String value,
  }) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 8,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveTaskSection() {
    final task = _activeTask;
    if (task == null) {
      return SizedBox(
        width: double.infinity,
        child: Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 32.0, horizontal: 16),
            child: Column(
              children: [
                Icon(Icons.check_circle, color: AppColors.secondary.withOpacity(0.4), size: 48),
                const SizedBox(height: 12),
                const Text(
                  'Tidak ada tugas aktif',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Anda sudah menyelesaikan semua tugas Anda untuk saat ini. Kerja bagus!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final effectiveStatus = _getEffectiveStatus(task);
    final scheduledTimeStr = DateFormat('HH:mm').format(task.scheduledAt);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderCustom, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner top border indicator
          Container(
            height: 4,
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.business_center, color: AppColors.primary, size: 16),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Tugas Saat Ini',
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                          color: AppColors.text,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFDE68A), width: 1),
                    ),
                    child: Text(
                      '${effectiveStatus == 'in_progress' ? 'Sedang Dikerjakan' : 'Segera'} - $scheduledTimeStr WIB',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFB45309),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderCustom),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Customer details card
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.borderLight.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderCustom, width: 1),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryBgDeep,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            task.userName?.isNotEmpty == true ? task.userName![0].toUpperCase() : 'P',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              task.userName ?? 'Pelanggan',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 14,
                                color: AppColors.text,
                              ),
                            ),
                            const SizedBox(height: 4),
                            InkWell(
                              onTap: () => _callPhone(_activeCustomer?.phone ?? '+6281234567890'),
                              child: Row(
                                children: [
                                  const Icon(Icons.phone_outlined, size: 13, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    _activeCustomer?.phone ?? '+62 812-3456-7890',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () => _openMap(task.addressDetail),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 13, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      task.addressDetail,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Service Details
                const Text(
                  'RINCIAN LAYANAN',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.text,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE6F4F1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.cleaning_services, color: AppColors.teal, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.serviceName ?? 'Layanan Kebersihan',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 6),
                          ..._getServiceDetails(task.serviceName).map(
                            (bullet) => Padding(
                              padding: const EdgeInsets.only(bottom: 4.0),
                              child: Row(
                                children: [
                                  Container(
                                    width: 6,
                                    height: 6,
                                    decoration: const BoxDecoration(
                                      color: AppColors.teal,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    bullet,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Chat, Travel & Arrival action row
                Row(
                  children: [
                    Expanded(
                      child: TextButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatScreen(order: task),
                            ),
                          );
                        },
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.borderLight,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        icon: const Icon(Icons.chat_bubble_outline, size: 16, color: AppColors.textSecondary),
                        label: const Text(
                          'Chat Pelanggan',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    if (effectiveStatus != 'in_progress') ...[
                      // Perjalanan Action button
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: (effectiveStatus == 'on_the_way' || effectiveStatus == 'arrived')
                              ? null
                              : () => _logMicroAction(
                                    task.id,
                                    'on_the_way',
                                    'Petugas sedang dalam perjalanan menuju lokasi.',
                                  ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: effectiveStatus == 'on_the_way'
                                ? Colors.orange
                                : effectiveStatus == 'arrived'
                                    ? AppColors.borderLight
                                    : const Color(0xFFFFF7ED),
                            foregroundColor: effectiveStatus == 'on_the_way'
                                ? Colors.white
                                : effectiveStatus == 'arrived'
                                    ? AppColors.textMuted
                                    : Colors.orange,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                color: effectiveStatus == 'on_the_way'
                                    ? Colors.orange
                                    : effectiveStatus == 'arrived'
                                        ? AppColors.borderCustom
                                        : const Color(0xFFFFEDD5),
                                width: 1,
                              ),
                            ),
                          ),
                          icon: const Icon(Icons.navigation_outlined, size: 16),
                          label: Text(
                            effectiveStatus == 'on_the_way'
                                ? 'Perjalanan (Aktif)'
                                : effectiveStatus == 'arrived'
                                    ? 'Perjalanan (Selesai)'
                                    : 'Perjalanan',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Tiba Action button
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: (effectiveStatus != 'on_the_way')
                              ? null
                              : () => _logMicroAction(
                                    task.id,
                                    'arrived',
                                    'Petugas telah tiba di lokasi.',
                                  ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: effectiveStatus == 'arrived'
                                ? AppColors.teal
                                : Colors.white,
                            foregroundColor: effectiveStatus == 'arrived'
                                ? Colors.white
                                : AppColors.teal,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                color: effectiveStatus == 'arrived'
                                    ? AppColors.teal
                                    : AppColors.borderCustom,
                                width: 1,
                              ),
                            ),
                          ),
                          icon: const Icon(Icons.check_circle_outline, size: 16),
                          label: Text(
                            effectiveStatus == 'arrived' ? 'Tiba (Aktif)' : 'Tiba',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),

                // Primary Start/Finish camera uploads
                if (_uploading)
                  const SizedBox(
                    width: double.infinity,
                    child: Card(
                      color: AppColors.primaryBg,
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                            SizedBox(width: 12),
                            Text(
                              'Mengupload bukti foto & memproses...',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else if (effectiveStatus != 'in_progress')
                  effectiveStatus == 'arrived'
                      ? SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => _triggerCameraPhotoUpload('start'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            icon: const Icon(Icons.camera_alt),
                            label: const Text('Mulai Pekerjaan & Foto Sebelum'),
                          ),
                        )
                      : Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            color: AppColors.borderLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.borderCustom),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.camera_alt, color: AppColors.textMuted),
                              SizedBox(width: 8),
                              Flexible(
                                child: Text(
                                  'Mulai Pekerjaan & Foto Sebelum (Terkunci)',
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: AppColors.textMuted,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                else
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _triggerCameraPhotoUpload('finish'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.teal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Selesai & Foto Sesudah'),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingTasksSection() {
    final upcoming = _upcomingTasks;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderCustom, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Jadwal Berikutnya',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  color: AppColors.text,
                ),
              ),
              GestureDetector(
                onTap: () {
                  // Switch tab programmatically (Active Tasks is index 1)
                  // Simply trigger navigation since the tab index state in MainLayout dictates it,
                  // we can provide a callback or instructions.
                },
                child: const Text(
                  'Lihat Semua',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (upcoming.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16.0),
              child: Center(
                child: Text(
                  'Belum ada tugas berikutnya.',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: upcoming.length > 3 ? 3 : upcoming.length, // Max 3 items on dashboard
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final order = upcoming[index];
                final scheduledTimeStr = DateFormat('HH:mm').format(order.scheduledAt);
                final isToday = DateFormat('yyyy-MM-dd').format(order.scheduledAt) == DateFormat('yyyy-MM-dd').format(DateTime.now());

                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => OrderDetailScreen(order: order),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderCustom, width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: const BoxDecoration(
                                color: AppColors.borderCustom,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  order.userName?.isNotEmpty == true ? order.userName![0].toUpperCase() : 'P',
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  order.userName ?? 'Pelanggan',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 13,
                                    color: AppColors.text,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  order.serviceName?.toUpperCase() ?? 'LAYANAN',
                                  style: const TextStyle(
                                    color: AppColors.textMuted,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 10, color: AppColors.primary),
                                    const SizedBox(width: 4),
                                    Text(
                                      '$scheduledTimeStr WIB${isToday ? "" : " (Besok)"}',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
