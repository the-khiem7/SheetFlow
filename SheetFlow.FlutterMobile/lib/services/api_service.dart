import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import '../config/api_config.dart';
import '../models/task.dart';
import '../models/daily_report.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ));

  final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 120,
      colors: true,
      printEmojis: true,
      printTime: true,
    ),
  );

  ApiService() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final startTime = DateTime.now();
        options.extra['startTime'] = startTime;

        _logger.i('🚀 API REQUEST STARTED');
        _logger.i('URL: ${options.method} ${options.baseUrl}${options.path}');
        _logger.i('Query Params: ${options.queryParameters}');
        _logger.i('Headers: ${options.headers}');
        if (options.data != null) {
          _logger.i('Request Body: ${options.data}');
        }
        _logger.i('Connect Timeout: ${options.connectTimeout?.inSeconds}s');
        _logger.i('Receive Timeout: ${options.receiveTimeout?.inSeconds}s');

        // Add API key header
        options.headers['X-API-Key'] = ApiConfig.apiKey;

        return handler.next(options);
      },
      onResponse: (response, handler) {
        final startTime = response.requestOptions.extra['startTime'] as DateTime?;
        final duration = startTime != null ? DateTime.now().difference(startTime) : null;

        _logger.i('✅ API RESPONSE RECEIVED');
        _logger.i('Status: ${response.statusCode} ${response.statusMessage}');
        _logger.i('URL: ${response.requestOptions.method} ${response.requestOptions.baseUrl}${response.requestOptions.path}');
        if (duration != null) {
          _logger.i('Duration: ${duration.inMilliseconds}ms');
        }
        _logger.i('Response Headers: ${response.headers.map}');
        _logger.i('Response Body: ${response.data}');

        return handler.next(response);
      },
      onError: (error, handler) {
        final startTime = error.requestOptions.extra['startTime'] as DateTime?;
        final duration = startTime != null ? DateTime.now().difference(startTime) : null;

        _logger.e('❌ API ERROR OCCURRED');
        _logger.e('Error Type: ${error.type}');
        _logger.e('URL: ${error.requestOptions.method} ${error.requestOptions.baseUrl}${error.requestOptions.path}');
        if (duration != null) {
          _logger.e('Duration: ${duration.inMilliseconds}ms');
        }

        // Detailed error information
        if (error.response != null) {
          _logger.e('Status Code: ${error.response?.statusCode}');
          _logger.e('Status Message: ${error.response?.statusMessage}');
          _logger.e('Response Headers: ${error.response?.headers.map}');
          _logger.e('Response Body: ${error.response?.data}');
        } else {
          _logger.e('No response received (network error)');
        }

        _logger.e('Error Message: ${error.message}');
        _logger.e('Stack Trace: ${error.stackTrace}');

        // Handle authentication errors
        if (error.response?.statusCode == 401) {
          _logger.w('Authentication error - API key may be invalid');
        }

        return handler.next(error);
      },
    ));
  }

  Future<List<Task>> getTasks({String? status, String? project}) async {
    _logger.d('📋 getTasks called - status: $status, project: $project');

    try {
      final params = <String, dynamic>{'path': 'tasks'};
      if (status != null) params['status'] = status;
      if (project != null) params['project'] = project;

      _logger.d('Building request params: $params');

      final response = await _dio.get('', queryParameters: params);

      _logger.d('Response received, checking data structure...');
      if (response.data == null) {
        _logger.e('Response data is null');
        throw Exception('Response data is null');
      }

      if (!response.data.containsKey('data')) {
        _logger.e('Response data does not contain "data" key. Full response: ${response.data}');
        throw Exception('Response does not contain data key');
      }

      final tasksData = response.data['data'];
      if (tasksData is! List) {
        _logger.e('Expected tasksData to be List, but got ${tasksData.runtimeType}. Value: $tasksData');
        throw Exception('Expected data to be a list');
      }

      _logger.d('Found ${tasksData.length} tasks, parsing...');
      final tasks = tasksData.map((json) {
        try {
          return Task.fromJson(json);
        } catch (e) {
          _logger.e('Failed to parse task JSON: $json, Error: $e');
          rethrow;
        }
      }).toList();

      _logger.i('✅ getTasks completed successfully - returned ${tasks.length} tasks');
      return tasks;
    } catch (e, stackTrace) {
      _logger.e('❌ getTasks failed: $e');
      _logger.e('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Future<Task> createTask(Task task) async {
    _logger.d('➕ createTask called - task: ${task.toJson()}');

    try {
      final taskJson = task.toJson();
      _logger.d('Task JSON payload: $taskJson');

      final response = await _dio.post(
        '?path=tasks',
        data: taskJson,
      );

      _logger.d('Response received, parsing task data...');
      if (response.data == null) {
        _logger.e('Response data is null');
        throw Exception('Response data is null');
      }

      if (!response.data.containsKey('data')) {
        _logger.e('Response data does not contain "data" key. Full response: ${response.data}');
        throw Exception('Response does not contain data key');
      }

      final createdTaskJson = response.data['data'];
      _logger.d('Created task JSON: $createdTaskJson');

      final createdTask = Task.fromJson(createdTaskJson);
      _logger.i('✅ createTask completed successfully - created task ID: ${createdTask.id}');
      return createdTask;
    } catch (e, stackTrace) {
      _logger.e('❌ createTask failed: $e');
      _logger.e('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Future<Task> updateTask(int id, Map<String, dynamic> updates) async {
    _logger.d('✏️ updateTask called - id: $id, updates: $updates');

    try {
      final url = '?path=tasks&id=$id&method=PUT';
      _logger.d('Request URL: $url');
      _logger.d('Update payload: $updates');

      final response = await _dio.post(
        url,
        data: updates,
      );

      _logger.d('Response received, parsing updated task data...');
      if (response.data == null) {
        _logger.e('Response data is null');
        throw Exception('Response data is null');
      }

      if (!response.data.containsKey('data')) {
        _logger.e('Response data does not contain "data" key. Full response: ${response.data}');
        throw Exception('Response does not contain data key');
      }

      final updatedTaskJson = response.data['data'];
      _logger.d('Updated task JSON: $updatedTaskJson');

      final updatedTask = Task.fromJson(updatedTaskJson);
      _logger.i('✅ updateTask completed successfully - updated task ID: $id');
      return updatedTask;
    } catch (e, stackTrace) {
      _logger.e('❌ updateTask failed for task $id: $e');
      _logger.e('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Future<void> deleteTask(int id) async {
    _logger.d('🗑️ deleteTask called - id: $id');

    try {
      final url = '?path=tasks&id=$id&method=DELETE';
      _logger.d('Request URL: $url');

      final response = await _dio.post(url);

      _logger.i('✅ deleteTask completed successfully - deleted task ID: $id');
      _logger.d('Response status: ${response.statusCode}');
    } catch (e, stackTrace) {
      _logger.e('❌ deleteTask failed for task $id: $e');
      _logger.e('Stack trace: $stackTrace');
      rethrow;
    }
  }

  Future<List<DailyReport>> getDailyReports() async {
    _logger.d('📊 getDailyReports called');

    try {
      final url = '?path=reports/daily';
      _logger.d('Request URL: $url');

      final response = await _dio.get(url);

      _logger.d('Response received, checking data structure...');
      if (response.data == null) {
        _logger.e('Response data is null');
        throw Exception('Response data is null');
      }

      if (!response.data.containsKey('data')) {
        _logger.e('Response data does not contain "data" key. Full response: ${response.data}');
        throw Exception('Response does not contain data key');
      }

      final reportsData = response.data['data'];
      if (reportsData is! List) {
        _logger.e('Expected reportsData to be List, but got ${reportsData.runtimeType}. Value: $reportsData');
        throw Exception('Expected data to be a list');
      }

      _logger.d('Found ${reportsData.length} reports, parsing...');
      final reports = reportsData.map((json) {
        try {
          return DailyReport.fromJson(json);
        } catch (e) {
          _logger.e('Failed to parse report JSON: $json, Error: $e');
          rethrow;
        }
      }).toList();

      _logger.i('✅ getDailyReports completed successfully - returned ${reports.length} reports');
      return reports;
    } catch (e, stackTrace) {
      _logger.e('❌ getDailyReports failed: $e');
      _logger.e('Stack trace: $stackTrace');
      rethrow;
    }
  }
}
