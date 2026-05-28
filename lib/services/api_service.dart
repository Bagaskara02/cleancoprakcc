import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  static const String apiUserOrderUrl = 'https://be-user-cleanco-739468618342.us-central1.run.app';
  static const String apiWorkerServiceUrl = 'https://be-admin-cleanco-739468618342.us-central1.run.app';

  // --- Worker Auth / Info (service-worker) ---

  static Future<Worker> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$apiWorkerServiceUrl/api/v2/workers/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200 || response.statusCode == 210 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data != null && data['worker'] != null) {
        return Worker.fromJson(data['worker']);
      }
      throw Exception('Format data login tidak valid.');
    } else {
      final errorData = jsonDecode(response.body);
      throw Exception(errorData['error'] ?? 'Gagal login. Periksa email dan sandi Anda.');
    }
  }

  static Future<Worker> getWorker(int workerId) async {
    final response = await http.get(Uri.parse('$apiWorkerServiceUrl/api/v2/workers/$workerId'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Worker.fromJson(data);
    }
    throw Exception('Gagal memuat profil pekerja.');
  }

  static Future<void> updateWorkerStatus(int workerId, String status) async {
    final response = await http.patch(
      Uri.parse('$apiWorkerServiceUrl/api/v2/workers/$workerId/status'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status}),
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Gagal memperbarui status ketersediaan.');
    }
  }

  // --- Orders & Tasks (service-user-order) ---

  static Future<List<Order>> getOrders() async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/orders'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Order.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat daftar tugas.');
  }

  static Future<void> updateOrderStatus(int orderId, String status) async {
    final response = await http.patch(
      Uri.parse('$apiUserOrderUrl/api/v1/orders/$orderId/status'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'status': status}),
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Gagal mengupdate status tugas.');
    }
  }

  static Future<void> addOrderHistoryLog({
    required int orderId,
    required String status,
    required String note,
    String photoUrl = '',
  }) async {
    final response = await http.post(
      Uri.parse('$apiUserOrderUrl/api/v1/order-history'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'orderId': orderId,
        'status': status,
        'updatedByRole': 'worker',
        'note': note,
        'photo_url': photoUrl,
      }),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Gagal menambahkan catatan histori tugas.');
    }
  }

  static Future<List<HistoryLog>> getOrderHistoryLogs(int orderId) async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/order-history/$orderId'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => HistoryLog.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat histori tugas.');
  }

  static Future<UserDetails> getUserDetails(int userId) async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/users/$userId'));
    if (response.statusCode == 200) {
      return UserDetails.fromJson(jsonDecode(response.body));
    }
    throw Exception('Gagal memuat data pelanggan.');
  }

  // --- Dynamic Service Catalog (service-worker) ---

  static Future<List<Map<String, dynamic>>> getServices() async {
    final response = await http.get(Uri.parse('$apiWorkerServiceUrl/api/v2/services'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Gagal memuat katalog layanan.');
  }

  // --- Reviews (service-user-order) ---

  static Future<List<Review>> getReviews(int workerId) async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/reviews/worker/$workerId'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Review.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat ulasan pekerja.');
  }

  // --- Notifications (service-user-order) ---

  static Future<List<AppNotification>> getNotifications(int workerId) async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/notifications/worker_$workerId'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => AppNotification.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat notifikasi pekerja.');
  }

  // --- Chats (service-user-order) ---

  static Future<List<ChatMessage>> getChats(int orderId) async {
    final response = await http.get(Uri.parse('$apiUserOrderUrl/api/v1/chats/$orderId'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => ChatMessage.fromJson(json)).toList();
    }
    throw Exception('Gagal memuat obrolan.');
  }

  static Future<void> sendChatMessage({
    required int orderId,
    required String senderId,
    required String message,
  }) async {
    final response = await http.post(
      Uri.parse('$apiUserOrderUrl/api/v1/chats'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'orderId': orderId,
        'senderId': senderId,
        'senderRole': 'worker',
        'message': message,
      }),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Gagal mengirim pesan.');
    }
  }

  // --- Photo Upload Service (service-worker) ---

  static Future<String> uploadPhoto(String filePath) async {
    final uri = Uri.parse('$apiWorkerServiceUrl/api/v2/photos/upload');
    final request = http.MultipartRequest('POST', uri);
    
    // Attach the file using fromPath
    request.files.add(await http.MultipartFile.fromPath('photo', filePath));
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data != null && data['url'] != null) {
        return data['url'];
      }
      throw Exception('Respon upload tidak memiliki URL foto.');
    } else {
      throw Exception('Gagal mengupload foto ke server.');
    }
  }
}
