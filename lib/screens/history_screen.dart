import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../main.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/theme.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Order> _completedOrders = [];
  List<Map<String, dynamic>> _services = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final orders = await ApiService.getOrders();
      
      List<Map<String, dynamic>> services = [];
      try {
        services = await ApiService.getServices();
      } catch (e) {
        debugPrint('Error fetching services in history: $e');
      }
      
      final completed = orders.where((o) => o.workerId == workerId && o.status == 'completed').toList();
      completed.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

      if (mounted) {
        setState(() {
          _completedOrders = completed;
          _services = services;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching history: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  IconData _getServiceIcon(String? serviceName) {
    final name = (serviceName ?? '').toLowerCase();
    if (name.contains('ac')) {
      return Icons.ac_unit; // Snowflake representation
    }
    if (name.contains('cleaning') || name.contains('bersih') || name.contains('ruang tamu')) {
      return Icons.auto_awesome; // Sparkles representation
    }
    if (name.contains('setrika') || name.contains('pakaian')) {
      return Icons.local_fire_department; // Flame representation
    }
    return Icons.bookmark;
  }

  Color _getServiceColor(String? serviceName) {
    final name = (serviceName ?? '').toLowerCase();
    if (name.contains('ac')) {
      return AppColors.teal;
    }
    if (name.contains('cleaning') || name.contains('bersih') || name.contains('ruang tamu')) {
      return AppColors.primary;
    }
    if (name.contains('setrika') || name.contains('pakaian')) {
      return AppColors.warning;
    }
    return AppColors.textLight;
  }

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
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final completedToday = _completedOrders.where((o) => DateFormat('yyyy-MM-dd').format(o.scheduledAt) == todayStr).toList();
    
    final earningsToday = completedToday.fold<double>(0.0, (sum, o) => sum + o.totalPrice);
    final countToday = completedToday.length;

    final currencyFormat = NumberFormat.currency(locale: 'id-ID', symbol: 'Rp', decimalDigits: 0);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchHistory,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Summary Row
              Row(
                children: [
                  Expanded(
                    child: _buildSummaryCard(
                      icon: Icons.credit_card,
                      iconColor: AppColors.primary,
                      bgColor: AppColors.primaryBg,
                      title: 'PENDAPATAN HARI INI',
                      value: currencyFormat.format(earningsToday),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildSummaryCard(
                      icon: Icons.check_circle,
                      iconColor: AppColors.teal,
                      bgColor: const Color(0xFFE6F4F1),
                      title: 'TOTAL TUGAS SELESAI',
                      value: '$countToday Tugas',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Title list
              const Text(
                'Riwayat Pekerjaan',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  color: AppColors.text,
                ),
              ),
              const SizedBox(height: 12),

              // Table/List
              if (_completedOrders.isEmpty)
                SizedBox(
                  width: double.infinity,
                  child: Card(
                    margin: EdgeInsets.zero,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40.0),
                      child: Column(
                        children: [
                          Icon(Icons.check_circle_outline, color: AppColors.textMuted.withOpacity(0.3), size: 40),
                          const SizedBox(height: 12),
                          const Text(
                            'Belum ada riwayat pekerjaan selesai.',
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
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _completedOrders.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final order = _completedOrders[index];
                    final serviceIcon = _getServiceIcon(order.serviceName);
                    final serviceColor = _getServiceColor(order.serviceName);

                    final durationMinutes = _getServiceDuration(order.serviceName);
                    final endTime = order.scheduledAt.add(Duration(minutes: durationMinutes));
                    final dateStr = DateFormat('d MMM yyyy', 'id_ID').format(endTime);
                    final startTimeStr = DateFormat('HH:mm').format(order.scheduledAt);
                    final endTimeStr = DateFormat('HH:mm').format(endTime);
                    final timeRangeStr = '$startTimeStr - $endTimeStr WIB';

                    return Card(
                      margin: EdgeInsets.zero,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Left Details
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: serviceColor.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: serviceColor.withOpacity(0.15)),
                                  ),
                                  child: Icon(serviceIcon, color: serviceColor, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      order.serviceName ?? 'Layanan',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 14,
                                        color: AppColors.text,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'ORDER #${order.id}',
                                      style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time, size: 10, color: AppColors.textMuted),
                                        const SizedBox(width: 4),
                                        Text(
                                          '$timeRangeStr  |  $dateStr',
                                          style: const TextStyle(
                                            fontSize: 9,
                                            color: AppColors.textLight,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            // Right Earnings
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE6F4F1),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFBBE3DB)),
                                  ),
                                  child: const Text(
                                    'Selesai',
                                    style: TextStyle(
                                      color: AppColors.teal,
                                      fontSize: 8,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  currencyFormat.format(order.totalPrice),
                                  style: const TextStyle(
                                    color: AppColors.teal,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String value,
  }) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
