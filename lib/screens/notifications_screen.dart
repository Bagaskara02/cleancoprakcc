import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../main.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';
import '../theme/theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<AppNotification> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    if (globalWorkerState.currentWorker == null) return;
    try {
      final workerId = globalWorkerState.currentWorker!.id;
      final notifications = await ApiService.getNotifications(workerId);
      
      // Sort newest first
      notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      // Fetch worker's orders to dynamically map and enrich job notifications
      List<Order> orders = [];
      try {
        final allOrders = await ApiService.getOrders();
        orders = allOrders.where((o) => o.workerId == workerId).toList();
      } catch (e) {
        debugPrint('Error loading orders for notifications screen: $e');
      }

      final enriched = notifications.map((notif) {
        final enrichedMsg = NotificationService.enrichNotificationMessage(notif, orders);
        return notif.copyWith(message: enrichedMsg);
      }).toList();

      if (mounted) {
        setState(() {
          _notifications = enriched;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Notifikasi Pekerja',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _notifications.isEmpty
                ? SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
                    child: Center(
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.borderLight,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.notifications_off_outlined, size: 48, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Belum ada notifikasi',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.text,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Anda akan menerima notifikasi jika ada pembaruan pekerjaan baru.',
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
                    itemCount: _notifications.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final notif = _notifications[index];
                      final dateStr = DateFormat('d MMM yyyy', 'id_ID').format(notif.createdAt);
                      final timeStr = '${DateFormat('HH:mm').format(notif.createdAt)} WIB';

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: notif.isRead ? Colors.white : AppColors.primaryBg.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: notif.isRead ? AppColors.borderCustom : AppColors.primaryLight.withOpacity(0.15),
                            width: 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.01),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: notif.isRead ? AppColors.borderLight : AppColors.primaryBgDeep,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(
                                Icons.info_outline,
                                color: notif.isRead ? AppColors.textLight : AppColors.primary,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    notif.title,
                                    style: TextStyle(
                                      color: AppColors.text,
                                      fontSize: 13,
                                      fontWeight: notif.isRead ? FontWeight.bold : FontWeight.w900,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    notif.message,
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today_outlined, size: 10, color: AppColors.textMuted),
                                      const SizedBox(width: 4),
                                      Text(
                                        '$dateStr — $timeStr',
                                        style: const TextStyle(
                                          fontSize: 9,
                                          color: AppColors.textMuted,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
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
