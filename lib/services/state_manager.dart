import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import 'api_service.dart';

class WorkerState extends ChangeNotifier {
  Worker? _currentWorker;
  bool _initialized = false;
  bool _isLoading = false;

  WorkerState() {
    loadSession();
  }

  Worker? get currentWorker => _currentWorker;
  bool get initialized => _initialized;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentWorker != null;

  Future<void> loadSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionStr = prefs.getString('workerData');
      if (sessionStr != null) {
        _currentWorker = Worker.fromJson(jsonDecode(sessionStr));
      }
    } catch (e) {
      debugPrint('Error loading worker session: $e');
    } finally {
      _initialized = true;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final worker = await ApiService.login(email, password);
      await saveSession(worker);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveSession(Worker worker) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('workerData', jsonEncode(worker.toJson()));
      _currentWorker = worker;
      notifyListeners();
    } catch (e) {
      debugPrint('Error saving worker session: $e');
      throw Exception('Gagal menyimpan sesi login.');
    }
  }

  Future<void> updateStatus(String status) async {
    if (_currentWorker == null) return;
    
    // Prevent going offline if status is busy
    if (_currentWorker!.status == 'busy' && status == 'offline') {
      throw Exception('Anda sedang dalam tugas aktif (Busy). Tidak dapat mengubah status menjadi Offline!');
    }

    try {
      await ApiService.updateWorkerStatus(_currentWorker!.id, status);
      
      final updatedWorker = Worker(
        id: _currentWorker!.id,
        name: _currentWorker!.name,
        email: _currentWorker!.email,
        phone: _currentWorker!.phone,
        status: status,
        role: _currentWorker!.role,
      );
      
      await saveSession(updatedWorker);
    } catch (e) {
      debugPrint('Error updating worker status: $e');
      rethrow;
    }
  }

  Future<void> refreshProfile() async {
    if (_currentWorker == null) return;
    try {
      final latest = await ApiService.getWorker(_currentWorker!.id);
      await saveSession(latest);
    } catch (e) {
      debugPrint('Error refreshing worker profile: $e');
    }
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('workerData');
      _currentWorker = null;
      notifyListeners();
    } catch (e) {
      debugPrint('Error logging out: $e');
    }
  }
}
