# SheetFlow Flutter Mobile Companion App - API Integration Guide

## Overview

This document describes the Flutter mobile companion app for SheetFlow, providing full CRUD operations for task management with offline support and synchronization with Google Sheets.

## Architecture

### Core Components

1. **API Service** (`lib/services/api_service.dart`)
   - HTTP client with Dio
   - API key authentication
   - Error handling and retry logic

2. **Database Helper** (`lib/services/database_helper.dart`)
   - SQLite local storage
   - CRUD operations for offline tasks
   - Sync status tracking

3. **Sync Service** (`lib/services/sync_service.dart`)
   - Periodic background sync (30s intervals)
   - Conflict resolution
   - Network status monitoring

4. **Task Provider** (`lib/providers/task_provider.dart`)
   - State management with Provider
   - Local/remote data coordination
   - Optimistic updates

5. **UI Components**
   - Task list screen
   - Task form dialog (`lib/widgets/task_form_dialog.dart`)
   - Loading states and error handling

## API Endpoints

### Base Configuration

```dart
const String baseUrl = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
const String apiKey = 'your-api-key-here'; // From Apps Script Properties
```

### Authentication

All requests include `X-API-Key` header:

```dart
final headers = {'X-API-Key': apiKey};
```

### Task Endpoints

#### 1. GET /api/tasks - List Tasks

**Request:**
```dart
final response = await dio.get(
  '$baseUrl?path=tasks&status=pending&project=ProjectA',
  options: Options(headers: headers),
);
```

**Parameters:**
- `status` (optional): Filter by status (pending, in-progress, finished)
- `project` (optional): Filter by project name

**Response:**
```json
{
  "data": [
    {
      "id": 3,
      "project": "Project A",
      "task": "Implement login",
      "priority": "High",
      "status": "Pending",
      "date": "2026-04-02",
      "assignee": "John",
      "pinned": false
    }
  ]
}
```

#### 2. POST /api/tasks - Create Task

**Request:**
```dart
final taskData = {
  'project': 'Project A',
  'task': 'New task description',
  'priority': 'Medium',
  'status': 'Pending',
  'date': '2026-04-02',
  'assignee': 'John',
  'pinned': false
};

final response = await dio.post(
  '$baseUrl?path=tasks',
  data: taskData,
  options: Options(headers: headers),
);
```

**Response:**
```json
{
  "data": {
    "id": 5,
    "project": "Project A",
    "task": "New task description",
    "priority": "Medium",
    "status": "Pending",
    "date": "2026-04-02",
    "assignee": "John",
    "pinned": false
  }
}
```

#### 3. PUT /api/tasks/:id - Update Task

**Request:**
```dart
final updateData = {
  'status': 'In Progress',
  'assignee': 'Jane'
};

final response = await dio.post(
  '$baseUrl?path=tasks&id=3&method=PUT',
  data: updateData,
  options: Options(headers: headers),
);
```

**Response:** Same as create task

#### 4. DELETE /api/tasks/:id - Delete Task

**Request:**
```dart
final response = await dio.post(
  '$baseUrl?path=tasks&id=3&method=DELETE',
  options: Options(headers: headers),
);
```

**Response:**
```json
{
  "data": {
    "deleted": true
  }
}
```

### Daily Report Endpoint

#### GET /api/reports/daily - Get Daily Reports

**Request:**
```dart
final response = await dio.get(
  '$baseUrl?path=reports/daily',
  options: Options(headers: headers),
);
```

**Response:**
```json
{
  "data": [
    {
      "date": "2026-04-02",
      "goals": "1. Project A\n- Implement login\n- Fix bugs",
      "finished": "1. Project A\n- Setup database"
    }
  ]
}
```

## Flutter Implementation

### API Service Class

```dart
class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ));

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        options.headers['X-API-Key'] = apiKey;
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle authentication errors, retries, etc.
        return handler.next(error);
      },
    ));
  }

  Future<List<Task>> getTasks({String? status, String? project}) async {
    final params = <String, dynamic>{'path': 'tasks'};
    if (status != null) params['status'] = status;
    if (project != null) params['project'] = project;

    final response = await _dio.get('', queryParameters: params);
    final tasksData = response.data['data'] as List;
    return tasksData.map((json) => Task.fromJson(json)).toList();
  }

  Future<Task> createTask(Task task) async {
    final response = await _dio.post(
      '?path=tasks',
      data: task.toJson(),
    );
    return Task.fromJson(response.data['data']);
  }

  Future<Task> updateTask(int id, Map<String, dynamic> updates) async {
    final response = await _dio.post(
      '?path=tasks&id=$id&method=PUT',
      data: updates,
    );
    return Task.fromJson(response.data['data']);
  }

  Future<void> deleteTask(int id) async {
    await _dio.post('?path=tasks&id=$id&method=DELETE');
  }

  Future<List<DailyReport>> getDailyReports() async {
    final response = await _dio.get('?path=reports/daily');
    final reportsData = response.data['data'] as List;
    return reportsData.map((json) => DailyReport.fromJson(json)).toList();
  }
}
```

### Task Model

```dart
class Task {
  final int id;
  final String project;
  final String task;
  final String priority;
  final String status;
  final String? date;
  final String assignee;
  final bool pinned;

  Task({
    required this.id,
    required this.project,
    required this.task,
    required this.priority,
    required this.status,
    this.date,
    required this.assignee,
    required this.pinned,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      project: json['project'],
      task: json['task'],
      priority: json['priority'],
      status: json['status'],
      date: json['date'],
      assignee: json['assignee'],
      pinned: json['pinned'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'project': project,
      'task': task,
      'priority': priority,
      'status': status,
      'date': date,
      'assignee': assignee,
      'pinned': pinned,
    };
  }
}
```

### Database Helper (SQLite)

```dart
class DatabaseHelper {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final path = join(await getDatabasesPath(), 'sheetflow.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE tasks(
        id INTEGER PRIMARY KEY,
        project TEXT,
        task TEXT,
        priority TEXT,
        status TEXT,
        date TEXT,
        assignee TEXT,
        pinned INTEGER,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');
  }

  Future<List<Task>> getTasks() async {
    final db = await database;
    final maps = await db.query('tasks');
    return maps.map((map) => Task.fromMap(map)).toList();
  }

  Future<int> insertTask(Task task) async {
    final db = await database;
    return await db.insert('tasks', task.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<int> updateTask(Task task) async {
    final db = await database;
    return await db.update(
      'tasks',
      task.toMap(),
      where: 'id = ?',
      whereArgs: [task.id],
    );
  }

  Future<int> deleteTask(int id) async {
    final db = await database;
    return await db.delete('tasks', where: 'id = ?', whereArgs: [id]);
  }
}
```

### Sync Service

```dart
class SyncService {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;
  Timer? _syncTimer;

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
          orElse: () => Task.empty(),
        );

        if (localTask.id == -1) {
          // New remote task
          await _dbHelper.insertTask(remoteTask);
        } else {
          // Update local with remote
          await _dbHelper.updateTask(remoteTask);
        }
      }

      // Mark all as synced
      // Implementation depends on your sync status tracking

    } catch (e) {
      // Handle sync errors
      print('Sync failed: $e');
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
}
```

### Task Provider

```dart
class TaskProvider with ChangeNotifier {
  final DatabaseHelper _dbHelper;
  final SyncService _syncService;
  List<Task> _tasks = [];

  TaskProvider(this._dbHelper, this._syncService) {
    loadTasks();
    _syncService.startPeriodicSync();
  }

  List<Task> get tasks => _tasks;

  Future<void> loadTasks() async {
    _tasks = await _dbHelper.getTasks();
    notifyListeners();
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
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateTask(Task task) async {
    final originalTask = task;
    _tasks[_tasks.indexWhere((t) => t.id == task.id)] = task;
    notifyListeners();

    try {
      final updatedTask = await _apiService.updateTask(task.id, task.toJson());
      await _dbHelper.updateTask(updatedTask);
    } catch (e) {
      // Revert on error
      _tasks[_tasks.indexWhere((t) => t.id == task.id)] = originalTask;
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
      notifyListeners();
      rethrow;
    }
  }

  @override
  void dispose() {
    _syncService.stopPeriodicSync();
    super.dispose();
  }
}
```

## Setup Instructions

### 1. Dependencies

Add to `pubspec.yaml`:

```yaml
dependencies:
  dio: ^5.0.0
  sqflite: ^2.0.0
  path_provider: ^2.0.0
  provider: ^6.0.0
  connectivity_plus: ^4.0.0
```

### 2. Configuration

Create `lib/config/api_config.dart`:

```dart
class ApiConfig {
  static const String baseUrl = 'YOUR_DEPLOYMENT_URL';
  static const String apiKey = 'YOUR_API_KEY';
}
```

### 3. Provider Setup

In `main.dart`:

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final dbHelper = DatabaseHelper();
  final apiService = ApiService();
  final syncService = SyncService(apiService, dbHelper);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => TaskProvider(dbHelper, syncService),
        ),
      ],
      child: MyApp(),
    ),
  );
}
```

## Error Handling

### Network Errors
- Implement retry logic with exponential backoff
- Show user-friendly error messages
- Queue operations for offline retry

### Authentication Errors
- Prompt user to check API key configuration
- Clear local data on auth failure

### Sync Conflicts
- Last-write-wins strategy for simplicity
- Show conflict notifications to user

## Testing

### Unit Tests
```dart
void main() {
  test('ApiService creates task successfully', () async {
    final apiService = ApiService();
    final task = Task(/* test data */);

    final result = await apiService.createTask(task);
    expect(result.id, isNotNull);
  });
}
```

### Integration Tests
- Test full CRUD cycle
- Test offline/online transitions
- Test sync conflicts

## Performance Considerations

1. **Lazy Loading**: Load tasks in pages for large datasets
2. **Caching**: Cache API responses locally
3. **Optimistic Updates**: Update UI immediately, sync in background
4. **Background Sync**: Don't block UI during sync operations

## Security

1. **API Key Storage**: Store securely (not in code)
2. **HTTPS Only**: Ensure all API calls use HTTPS
3. **Input Validation**: Validate all user inputs before API calls
4. **Error Handling**: Don't leak sensitive information in error messages