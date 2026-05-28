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

class OrderDetailScreen extends StatefulWidget {
  final Order order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late Order _order;
  bool _loading = false;
  bool _uploading = false;
  
  UserDetails? _customer;
  List<HistoryLog> _historyLogs = [];
  Timer? _pollingTimer;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _order = widget.order;
    _fetchDetails();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollOrderDetailsOnly());
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchDetails() async {
    setState(() {
      _loading = _customer == null;
    });

    try {
      final orders = await ApiService.getOrders();
      final found = orders.firstWhere((o) => o.id == _order.id);
      
      UserDetails? customer;
      try {
        customer = await ApiService.getUserDetails(found.userId);
      } catch (e) {
        debugPrint('Error fetching customer details: $e');
      }

      List<HistoryLog> history = [];
      try {
        history = await ApiService.getOrderHistoryLogs(found.id);
      } catch (e) {
        debugPrint('Error fetching history logs: $e');
      }

      if (mounted) {
        setState(() {
          _order = found;
          if (customer != null) {
            _customer = customer;
          }
          _historyLogs = history;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching details: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _pollOrderDetailsOnly() async {
    try {
      final orders = await ApiService.getOrders();
      final found = orders.firstWhere((o) => o.id == _order.id);
      
      List<HistoryLog> history = [];
      try {
        history = await ApiService.getOrderHistoryLogs(found.id);
      } catch (e) {
        debugPrint('Error fetching history logs during poll: $e');
      }

      if (mounted) {
        setState(() {
          _order = found;
          _historyLogs = history;
        });
      }
    } catch (e) {
      debugPrint('Error polling order details: $e');
    }
  }

  String _getEffectiveStatus() {
    if (_order.status == 'completed' || _order.status == 'in_progress') {
      return _order.status;
    }
    final hasArrivedLog = _historyLogs.any((log) => log.status == 'arrived');
    if (hasArrivedLog) return 'arrived';
    final hasOnTheWayLog = _historyLogs.any((log) => log.status == 'on_the_way');
    if (hasOnTheWayLog) return 'on_the_way';
    return _order.status;
  }

  Future<void> _logMicroAction(String actionName, String note) async {
    try {
      await ApiService.addOrderHistoryLog(
        orderId: _order.id,
        status: actionName,
        note: note,
      );

      if (actionName == 'on_the_way' || actionName == 'arrived') {
        try {
          await globalWorkerState.updateStatus('busy');
        } catch (e) {
          debugPrint('Error updating availability state: $e');
        }
      }

      await _fetchDetails();
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
    try {
      // Pick image directly from the camera
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 70, // Optimize file size
      );

      if (image == null) {
        return;
      }

      setState(() {
        _uploading = true;
      });

      // Upload captured photo
      final photoUrl = await ApiService.uploadPhoto(image.path);

      if (actionType == 'start') {
        await ApiService.updateOrderStatus(_order.id, 'in_progress');
        await ApiService.addOrderHistoryLog(
          orderId: _order.id,
          status: 'in_progress',
          note: 'Pekerja telah tiba dan mulai membersihkan.',
          photoUrl: photoUrl,
        );
      } else if (actionType == 'finish') {
        await ApiService.updateOrderStatus(_order.id, 'completed');
        await ApiService.addOrderHistoryLog(
          orderId: _order.id,
          status: 'completed',
          note: 'Pekerjaan selesai dilakukan dengan baik.',
          photoUrl: photoUrl,
        );

        try {
          await globalWorkerState.updateStatus('available');
        } catch (e) {
          debugPrint('Error updating availability status after completion: $e');
        }
      }

      await _fetchDetails();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Berhasil memperbarui status menjadi: ${actionType == 'start' ? 'in_progress' : 'completed'}')),
      );
    } catch (e) {
      debugPrint('Upload/Action error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal mengupload foto & mengupdate status')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _uploading = false;
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
      return Scaffold(
        appBar: AppBar(title: const Text('Detail Tugas')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final effectiveStatus = _getEffectiveStatus();
    final dateStr = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_order.scheduledAt);
    final timeStr = '${DateFormat('HH:mm').format(_order.scheduledAt)} WIB';

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Detail Tugas',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
            Text(
              'ORDER ID #${_order.id}',
              style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Customer Info card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderCustom),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'PELANGGAN',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.text,
                          letterSpacing: 1,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: effectiveStatus == 'completed'
                              ? const Color(0xFFE6F4F1)
                              : effectiveStatus == 'in_progress'
                                  ? AppColors.primaryBg
                                  : const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: effectiveStatus == 'completed'
                                ? const Color(0xFFBBE3DB)
                                : effectiveStatus == 'in_progress'
                                    ? AppColors.primaryLight.withOpacity(0.2)
                                    : const Color(0xFFFDE68A),
                          ),
                        ),
                        child: Text(
                          effectiveStatus == 'in_progress' ? 'Dikerjakan' : effectiveStatus.toUpperCase(),
                          style: TextStyle(
                            color: effectiveStatus == 'completed'
                                ? AppColors.teal
                                : effectiveStatus == 'in_progress'
                                    ? AppColors.primary
                                    : const Color(0xFFB45309),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryBgDeep,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            _order.userName?.isNotEmpty == true ? _order.userName![0].toUpperCase() : 'P',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
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
                              _order.userName ?? 'Pelanggan',
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                                color: AppColors.text,
                              ),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () => _callPhone(_customer?.phone ?? '+6281234567890'),
                              child: Row(
                                children: [
                                  const Icon(Icons.phone_outlined, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 6),
                                  Text(
                                    _customer?.phone ?? '+62 812-3456-7890',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () => _openMap(_order.addressDetail),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      _order.addressDetail,
                                      style: const TextStyle(
                                        fontSize: 13,
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
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Service & Time specifications
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderCustom),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'LAYANAN',
                          style: TextStyle(fontSize: 8, color: AppColors.textMuted, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.business_center, size: 14, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                _order.serviceName ?? 'Layanan',
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, color: AppColors.text, fontWeight: FontWeight.w800),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderCustom),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'WAKTU PENJADWALAN',
                          style: TextStyle(fontSize: 8, color: AppColors.textMuted, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.access_time, size: 14, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '$dateStr - $timeStr',
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 11, color: AppColors.text, fontWeight: FontWeight.w800),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Chat with Customer button
            if (_order.status != 'completed' && _order.status != 'cancelled') ...[
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ChatScreen(order: _order),
                      ),
                    );
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: AppColors.borderLight,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  icon: const Icon(Icons.chat_bubble_outline, color: AppColors.textSecondary),
                  label: const Text(
                    'Chat Pelanggan',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Work Log Timeline
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderCustom),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'LOG & AKSI PEKERJAAN',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppColors.text,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (effectiveStatus != 'in_progress' && effectiveStatus != 'completed') ...[
                    // Berangkat & Tiba
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: (effectiveStatus == 'on_the_way' || effectiveStatus == 'arrived')
                                ? null
                                : () => _logMicroAction(
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
                                ),
                              ),
                            ),
                            icon: const Icon(Icons.navigation_outlined, size: 16),
                            label: Text(
                              effectiveStatus == 'on_the_way'
                                  ? 'Berangkat (Aktif)'
                                  : effectiveStatus == 'arrived'
                                      ? 'Berangkat (Selesai)'
                                      : 'Berangkat',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: (effectiveStatus != 'on_the_way')
                                ? null
                                : () => _logMicroAction(
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
                                ),
                              ),
                            ),
                            icon: const Icon(Icons.check_circle_outline, size: 16),
                            label: Text(
                              effectiveStatus == 'arrived' ? 'Tiba (Aktif)' : 'Tiba di Lokasi',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_uploading)
                      const Center(child: CircularProgressIndicator())
                    else if (effectiveStatus == 'arrived')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _triggerCameraPhotoUpload('start'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Mulai Pekerjaan & Foto Sebelum'),
                        ),
                      )
                    else
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.borderLight,
                          borderRadius: BorderRadius.circular(12),
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
                                style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],

                  if (effectiveStatus == 'in_progress') ...[
                    if (_uploading)
                      const Center(child: CircularProgressIndicator())
                    else
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _triggerCameraPhotoUpload('finish'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.teal,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          icon: const Icon(Icons.camera_alt),
                          label: const Text('Selesaikan Pekerjaan & Foto Sesudah'),
                        ),
                      ),
                  ],

                  if (effectiveStatus == 'completed') ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE6F4F1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFBBE3DB)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.stars_outlined, color: AppColors.teal),
                          SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              'Tugas ini telah selesai dengan sukses! 🎉',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: AppColors.teal, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
