DateTime parseUtcDateTime(dynamic value) {
  if (value == null) return DateTime.now();
  final dateStr = value.toString().trim();
  if (dateStr.isEmpty) return DateTime.now();
  
  // If the date string doesn't have a timezone indicator, append 'Z' to treat it as UTC
  bool hasTz = dateStr.endsWith('Z') || dateStr.contains('+');
  if (!hasTz) {
    // Check if there is a minus sign in the time part (after T or space)
    final timeSepIndex = dateStr.contains('T') ? dateStr.indexOf('T') : dateStr.indexOf(' ');
    if (timeSepIndex != -1) {
      final timePart = dateStr.substring(timeSepIndex + 1);
      if (timePart.contains('-')) {
        hasTz = true;
      }
    }
  }
  
  final parsedStr = hasTz ? dateStr : '${dateStr}Z';
  try {
    return DateTime.parse(parsedStr).toLocal();
  } catch (e) {
    try {
      return DateTime.parse(dateStr).toLocal();
    } catch (_) {
      return DateTime.now();
    }
  }
}

class Worker {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String status;
  final String role;

  Worker({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.status,
    required this.role,
  });

  factory Worker.fromJson(Map<String, dynamic> json) {
    return Worker(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      status: json['status'] ?? 'available',
      role: json['role'] ?? 'worker',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'status': status,
      'role': role,
    };
  }
}

class Order {
  final int id;
  final int userId;
  final String? userName;
  final String addressDetail;
  final int serviceId;
  final String? serviceName;
  final DateTime scheduledAt;
  final double totalPrice;
  final String status;
  final int? workerId;
  final DateTime updatedAt;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.userId,
    this.userName,
    required this.addressDetail,
    required this.serviceId,
    this.serviceName,
    required this.scheduledAt,
    required this.totalPrice,
    required this.status,
    this.workerId,
    required this.updatedAt,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final scheduledAtRaw = json['scheduled_at'] ?? json['scheduledAt'];
    final updatedAtRaw = json['updated_at'] ?? json['updatedAt'];
    final createdAtRaw = json['created_at'] ?? json['createdAt'];
    
    final scheduledAtVal = parseUtcDateTime(scheduledAtRaw);

    return Order(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['user_id'] is int ? json['user_id'] : int.parse(json['user_id'].toString()),
      userName: json['user_name'],
      addressDetail: json['address_detail'] ?? '',
      serviceId: json['service_id'] is int ? json['service_id'] : int.parse(json['service_id'].toString()),
      serviceName: json['service_name'],
      scheduledAt: scheduledAtVal,
      totalPrice: json['total_price'] != null 
          ? double.parse(json['total_price'].toString()) 
          : 0.0,
      status: json['status'] ?? 'pending',
      workerId: json['worker_id'] != null 
          ? (json['worker_id'] is int ? json['worker_id'] : int.tryParse(json['worker_id'].toString()))
          : null,
      updatedAt: updatedAtRaw != null 
          ? parseUtcDateTime(updatedAtRaw) 
          : scheduledAtVal,
      createdAt: createdAtRaw != null 
          ? parseUtcDateTime(createdAtRaw) 
          : scheduledAtVal,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'user_name': userName,
      'address_detail': addressDetail,
      'service_id': serviceId,
      'service_name': serviceName,
      'scheduled_at': scheduledAt.toIso8601String(),
      'total_price': totalPrice,
      'status': status,
      'worker_id': workerId,
      'updated_at': updatedAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class HistoryLog {
  final String? id;
  final int orderId;
  final String status;
  final String updatedByRole;
  final String note;
  final String? photoUrl;
  final DateTime timestamp;

  HistoryLog({
    this.id,
    required this.orderId,
    required this.status,
    required this.updatedByRole,
    required this.note,
    this.photoUrl,
    required this.timestamp,
  });

  factory HistoryLog.fromJson(Map<String, dynamic> json) {
    final timestampRaw = json['timestamp'] ?? json['createdAt'] ?? json['created_at'];
    return HistoryLog(
      id: json['id']?.toString(),
      orderId: json['orderId'] != null 
          ? (json['orderId'] is int ? json['orderId'] : int.tryParse(json['orderId'].toString()) ?? 0)
          : (json['order_id'] != null 
              ? (json['order_id'] is int ? json['order_id'] : int.tryParse(json['order_id'].toString()) ?? 0)
              : 0),
      status: json['status'] ?? '',
      updatedByRole: json['updatedByRole'] ?? 'worker',
      note: json['note'] ?? '',
      photoUrl: json['photo_url'] ?? '',
      timestamp: parseUtcDateTime(timestampRaw),
    );
  }
}

class UserDetails {
  final int id;
  final String name;
  final String email;
  final String phone;

  UserDetails({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
  });

  factory UserDetails.fromJson(Map<String, dynamic> json) {
    return UserDetails(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? 'Pelanggan',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '+62 812-3456-7890',
    );
  }
}

class Review {
  final int id;
  final int userId;
  final int workerId;
  final int orderId;
  final double rating;
  final String comment;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.userId,
    required this.workerId,
    required this.orderId,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      userId: json['user_id'] is int ? json['user_id'] : int.parse(json['user_id'].toString()),
      workerId: json['worker_id'] is int ? json['worker_id'] : int.parse(json['worker_id'].toString()),
      orderId: json['order_id'] is int ? json['order_id'] : int.parse(json['order_id'].toString()),
      rating: json['rating'] != null ? double.parse(json['rating'].toString()) : 0.0,
      comment: json['comment'] ?? '',
      createdAt: parseUtcDateTime(json['created_at'] ?? json['createdAt']),
    );
  }
}

class AppNotification {
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  AppNotification copyWith({
    String? title,
    String? message,
    bool? isRead,
    DateTime? createdAt,
  }) {
    return AppNotification(
      title: title ?? this.title,
      message: message ?? this.message,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      isRead: json['isRead'] is bool ? json['isRead'] : (json['isRead'] == 1 || json['isRead'] == 'true'),
      createdAt: parseUtcDateTime(json['createdAt'] ?? json['created_at']),
    );
  }
}

class ChatMessage {
  final int orderId;
  final String senderId;
  final String senderRole;
  final String message;
  final DateTime timestamp;

  ChatMessage({
    required this.orderId,
    required this.senderId,
    required this.senderRole,
    required this.message,
    required this.timestamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    final orderIdRaw = json['orderId'] ?? json['order_id'];
    final senderIdRaw = json['senderId'] ?? json['sender_id'];
    final senderRoleRaw = json['senderRole'] ?? json['sender_role'];
    final messageRaw = json['message'] ?? '';
    final timestampRaw = json['timestamp'] ?? json['created_at'] ?? json['createdAt'];

    return ChatMessage(
      orderId: orderIdRaw is int ? orderIdRaw : int.tryParse(orderIdRaw?.toString() ?? '') ?? 0,
      senderId: senderIdRaw?.toString() ?? '',
      senderRole: senderRoleRaw?.toString() ?? '',
      message: messageRaw?.toString() ?? '',
      timestamp: parseUtcDateTime(timestampRaw),
    );
  }
}
