import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../main.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../theme/theme.dart';
import 'order_detail_screen.dart';

class ActiveTasksScreen extends StatefulWidget {
  const ActiveTasksScreen({super.key});

  @override
  State<ActiveTasksScreen> createState() => _ActiveTasksScreenState();
}

class _ActiveTasksScreenState extends State<ActiveTasksScreen> {
  List<Order> _activeTasks = [];
  bool _loading = true;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _fetchActiveTasks();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollActiveTasks());
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchActiveTasks() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final orders = await ApiService.getOrders();
      
      final active = orders.where(
        (o) => o.workerId == workerId && o.status != 'completed' && o.status != 'cancelled'
      ).toList();

      active.sort((a, b) {
        if (a.status == 'in_progress' && b.status != 'in_progress') return -1;
        if (a.status != 'in_progress' && b.status == 'in_progress') return 1;
        return a.scheduledAt.compareTo(b.scheduledAt);
      });

      if (mounted) {
        setState(() {
          _activeTasks = active;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching active tasks: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _pollActiveTasks() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final orders = await ApiService.getOrders();
      final active = orders.where(
        (o) => o.workerId == workerId && o.status != 'completed' && o.status != 'cancelled'
      ).toList();

      active.sort((a, b) {
        if (a.status == 'in_progress' && b.status != 'in_progress') return -1;
        if (a.status != 'in_progress' && b.status == 'in_progress') return 1;
        return a.scheduledAt.compareTo(b.scheduledAt);
      });

      if (mounted) {
        setState(() {
          _activeTasks = active;
        });
      }
    } catch (e) {
      debugPrint('Error polling active tasks: $e');
    }
  }

  Color _getStatusBg(String status) {
    switch (status) {
      case 'in_progress':
        return AppColors.primaryBg;
      case 'on_the_way':
        return const Color(0xFFFFF7ED);
      case 'arrived':
        return const Color(0xFFE6F4F1);
      default:
        return const Color(0xFFFEF3C7);
    }
  }

  Color _getStatusBorder(String status) {
    switch (status) {
      case 'in_progress':
        return AppColors.primaryLight.withOpacity(0.2);
      case 'on_the_way':
        return const Color(0xFFFED7AA);
      case 'arrived':
        return const Color(0xFFBBE3DB);
      default:
        return const Color(0xFFFDE68A);
    }
  }

  Color _getStatusText(String status) {
    switch (status) {
      case 'in_progress':
        return AppColors.primary;
      case 'on_the_way':
        return Colors.orange;
      case 'arrived':
        return AppColors.teal;
      default:
        return const Color(0xFFB45309);
    }
  }

  String _getStatusLabel(String status) {
    if (status == 'in_progress') return 'Dikerjakan';
    return status.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _fetchActiveTasks,
        child: _activeTasks.isEmpty
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
                child: Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.bg,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.assignment_outlined, size: 48, color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Tidak ada tugas aktif',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.text,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Anda sudah menyelesaikan semua tugas saat ini.',
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
              )
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                itemCount: _activeTasks.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final task = _activeTasks[index];
                  final statusBg = _getStatusBg(task.status);
                  final statusBorder = _getStatusBorder(task.status);
                  final statusText = _getStatusText(task.status);
                  final statusLabel = _getStatusLabel(task.status);

                  final dateStr = DateFormat('EEE, d MMM yyyy', 'id_ID').format(task.scheduledAt);
                  final timeStr = '${DateFormat('HH:mm').format(task.scheduledAt)} WIB';

                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderCustom),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Card Top Border Line mapping status color
                        Container(
                          height: 4,
                          decoration: BoxDecoration(
                            color: statusText,
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(20),
                              topRight: Radius.circular(20),
                            ),
                          ),
                        ),

                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Order id & status badge
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'ORDER #${task.id}',
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusBg,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: statusBorder, width: 1),
                                    ),
                                    child: Text(
                                      statusLabel,
                                      style: TextStyle(
                                        color: statusText,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                task.serviceName ?? 'Layanan Kebersihan',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  color: AppColors.text,
                                ),
                              ),
                              const SizedBox(height: 12),

                              // Info items
                              Row(
                                children: [
                                  Container(
                                    width: 22,
                                    height: 22,
                                    decoration: const BoxDecoration(
                                      color: AppColors.borderLight,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Center(
                                      child: Text(
                                        task.userName?.isNotEmpty == true ? task.userName![0].toUpperCase() : 'P',
                                        style: const TextStyle(
                                          color: AppColors.textLight,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  RichText(
                                    text: TextSpan(
                                      text: 'Pelanggan: ',
                                      style: const TextStyle(
                                        color: AppColors.textSecondary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      children: [
                                        TextSpan(
                                          text: task.userName ?? 'Pelanggan',
                                          style: const TextStyle(
                                            color: AppColors.text,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 8),
                                  Text(
                                    dateStr,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 8),
                                  Text(
                                    timeStr,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      task.addressDetail,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Card Footer Button
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: const BoxDecoration(
                            color: AppColors.borderLight,
                            borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(20),
                              bottomRight: Radius.circular(20),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => OrderDetailScreen(order: task),
                                    ),
                                  );
                                },
                                child: const Row(
                                  children: [
                                    Text(
                                      'Buka Detail Tugas',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    SizedBox(width: 4),
                                    Icon(Icons.chevron_right, color: AppColors.primary, size: 16),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
