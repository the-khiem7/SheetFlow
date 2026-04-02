import 'dart:io';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../services/sync_service.dart';
import '../models/task.dart';

class TaskProvider with ChangeNotifier {
  final DatabaseHelper _dbHelper;
  final ApiService _apiService;
  final SyncService _syncService;

  List<Task> _tasks = [];
  bool _isLoading = false;
  String? _error;

  TaskProvider(this._dbHelper, this._apiService, this._syncService) {
    loadTasks();
    _syncService.startPeriodicSync();
  }

  List<Task> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadTasks() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // First load from local database for immediate display
      _tasks = await _dbHelper.getTasks();

      // Then try to sync with remote API to get latest data
      if (await _hasInternetConnection()) {
        await _syncService.syncTasks();
        // Reload from database after sync
        _tasks = await _dbHelper.getTasks();
      }
    } catch (e) {
      _error = 'Failed to load tasks: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> _hasInternetConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } on SocketException catch (_) {
      return false;
    }
  }

  Future<void> addTask(Task task) async {
    // Optimistic update
    _tasks.add(task);
    notifyListeners();

    try {
      final createdTask = await _apiService.createTask(task);
      // Update with server response
      final index = _tasks.indexWhere((t) => t.id == task.id);
      if (index != -1) {
        _tasks[index] = createdTask;
        await _dbHelper.insertTask(createdTask);
      }
    } catch (e) {
      // Revert on error
      _tasks.remove(task);
      _error = 'Failed to create task: $e';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateTask(Task updatedTask) async {
    final originalTask = _tasks.firstWhere((t) => t.id == updatedTask.id);
    final index = _tasks.indexWhere((t) => t.id == updatedTask.id);

    // Optimistic update
    _tasks[index] = updatedTask;
    notifyListeners();

    try {
      final serverTask = await _apiService.updateTask(updatedTask.id, updatedTask.toJson());
      await _dbHelper.updateTask(serverTask);
    } catch (e) {
      // Revert on error
      _tasks[index] = originalTask;
      _error = 'Failed to update task: $e';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteTask(int id) async {
    final taskToDelete = _tasks.firstWhere((t) => t.id == id);
    _tasks.removeWhere((t) => t.id == id);
    notifyListeners();

    try {
      await _apiService.deleteTask(id);
      await _dbHelper.deleteTask(id);
    } catch (e) {
      // Restore on error
      _tasks.add(taskToDelete);
      _error = 'Failed to delete task: $e';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> refreshTasks() async {
    try {
      await _syncService.forceSync();
      await loadTasks();
    } catch (e) {
      _error = 'Failed to refresh tasks: $e';
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _syncService.stopPeriodicSync();
    super.dispose();
  }
}
