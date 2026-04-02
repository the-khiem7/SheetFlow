import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';
import 'database_helper.dart';
import '../models/task.dart';

class SyncService {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;
  Timer? _syncTimer;
  final Connectivity _connectivity = Connectivity();

  SyncService(this._apiService, this._dbHelper);

  void startPeriodicSync() {
    _syncTimer = Timer.periodic(Duration(seconds: 30), (_) async {
      if (await _hasInternetConnection()) {
        await syncTasks();
      }
    });
  }

  void stopPeriodicSync() {
    _syncTimer?.cancel();
  }

  Future<void> syncTasks() async {
    try {
      // Get remote tasks
      final remoteTasks = await _apiService.getTasks();

      // Get local tasks
      final localTasks = await _dbHelper.getTasks();

      // Sync logic: remote takes precedence for conflicts
      for (final remoteTask in remoteTasks) {
        final localTask = localTasks.firstWhere(
          (t) => t.id == remoteTask.id,
          orElse: () => Task(
            id: -1,
            project: '',
            task: '',
            priority: '',
            status: '',
            assignee: '',
            pinned: false,
          ),
        );

        if (localTask.id == -1) {
          // New remote task
          await _dbHelper.insertTask(remoteTask);
        } else {
          // Update local with remote (last-write-wins)
          await _dbHelper.updateTask(remoteTask);
        }
      }

      // Mark all as synced
      // Note: In a full implementation, you'd track sync status more carefully
      print('Tasks synced successfully');

    } catch (e) {
      print('Sync failed: $e');
      // In production, you might want to retry or show user notification
    }
  }

  Future<bool> _hasInternetConnection() async {
    try {
      final result = await _connectivity.checkConnectivity();
      if (result == ConnectivityResult.none) {
        return false;
      }

      // Additional check with a simple HTTP request
      final result2 = await InternetAddress.lookup('google.com');
      return result2.isNotEmpty && result2[0].rawAddress.isNotEmpty;
    } on SocketException catch (_) {
      return false;
    }
  }

  Future<void> forceSync() async {
    if (await _hasInternetConnection()) {
      await syncTasks();
    } else {
      throw Exception('No internet connection available');
    }
  }
}
