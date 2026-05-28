import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../main.dart';
import '../models/models.dart';
import 'api_service.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _localNotificationsPlugin = FlutterLocalNotificationsPlugin();
  
  static Future<void> init() async {
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initSettings = InitializationSettings(android: androidSettings);
    
    await _localNotificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse details) {
        debugPrint('Notification clicked: ${details.payload}');
      },
    );
    
    // Create Android Notification Channel explicitly for high importance
    final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
        _localNotificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
            
    if (androidImplementation != null) {
      // Request permission for Android 13+ (API 33+)
      try {
        await androidImplementation.requestNotificationsPermission();
      } catch (e) {
        debugPrint('Error requesting notification permission: $e');
      }

      await androidImplementation.createNotificationChannel(
        const AndroidNotificationChannel(
          'cleanco_mitra_channel',
          'CleanCo Mitra Notifications',
          description: 'Notifications for CleanCo Mitra workers',
          importance: Importance.max,
          playSound: true,
          enableVibration: true,
        ),
      );
    }
  }
  
  static String enrichNotificationMessage(AppNotification notif, List<Order> orders) {
    if (notif.title.toLowerCase().contains('pekerjaan') || notif.message.toLowerCase().contains('pekerjaan')) {
      // Find the closest order by timestamp (createdAt)
      Order? closestOrder;
      int closestDiffSeconds = 999999;
      
      for (final order in orders) {
        final diff = (order.createdAt.difference(notif.createdAt).inSeconds).abs();
        if (diff < closestDiffSeconds && diff < 3600) { // within 1 hour difference
          closestDiffSeconds = diff;
          closestOrder = order;
        }
      }
      
      // Fallback: match by closest time diff if no perfect match
      if (closestOrder == null && orders.isNotEmpty) {
        for (final order in orders) {
          final diff = (order.scheduledAt.difference(notif.createdAt).inSeconds).abs();
          if (diff < closestDiffSeconds) {
            closestDiffSeconds = diff;
            closestOrder = order;
          }
        }
      }
      
      if (closestOrder != null) {
        final timeStr = DateFormat('HH:mm').format(closestOrder.scheduledAt);
        return 'Pekerjaan: ${closestOrder.serviceName}\nPelanggan: ${closestOrder.userName ?? "Mitra CleanCo"}\nJam: $timeStr WIB';
      }
    }
    return notif.message;
  }
  
  static Future<void> checkNewNotifications() async {
    final worker = globalWorkerState.currentWorker;
    if (worker == null) return;
    
    try {
      final notifications = await ApiService.getNotifications(worker.id);
      if (notifications.isEmpty) return;
      
      final prefs = await SharedPreferences.getInstance();
      final lastTimeStr = prefs.getString('last_notification_time');
      
      // If we don't have a last seen timestamp, initialize it with current time so we don't spam historical notifications
      if (lastTimeStr == null) {
        if (notifications.isNotEmpty) {
          // Sort newest first to get the most recent notification time
          notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          await prefs.setString('last_notification_time', notifications.first.createdAt.toIso8601String());
        }
        return;
      }
      
      final DateTime lastTime = DateTime.parse(lastTimeStr);
      
      // Sort notifications by time ascending to process older ones first
      notifications.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      
      List<Order> orders = [];
      bool fetchedOrders = false;
      DateTime newestTime = lastTime;
      
      for (final notif in notifications) {
        if (notif.createdAt.isAfter(lastTime)) {
          if (!fetchedOrders) {
            final allOrders = await ApiService.getOrders();
            orders = allOrders.where((o) => o.workerId == worker.id).toList();
            fetchedOrders = true;
          }
          
          final enrichedMsg = enrichNotificationMessage(notif, orders);
          await showLocalNotification(notif.title, enrichedMsg);
          
          if (notif.createdAt.isAfter(newestTime)) {
            newestTime = notif.createdAt;
          }
        }
      }
      
      await prefs.setString('last_notification_time', newestTime.toIso8601String());
    } catch (e) {
      debugPrint('Error checking notifications: $e');
    }
  }
  
  static Future<void> showLocalNotification(String title, String body) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'cleanco_mitra_channel',
      'CleanCo Mitra Notifications',
      channelDescription: 'Notifications for CleanCo Mitra workers',
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      playSound: true,
      enableVibration: true,
      styleInformation: BigTextStyleInformation(''), // Enable multiline support
    );
    
    const NotificationDetails platformDetails = NotificationDetails(android: androidDetails);
    
    // Generate unique ID
    final int notifId = DateTime.now().millisecond + (DateTime.now().second * 1000);
    
    await _localNotificationsPlugin.show(
      notifId,
      title,
      body,
      platformDetails,
    );
  }
}
