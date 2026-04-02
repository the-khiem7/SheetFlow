import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/task.dart';

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
        project TEXT NOT NULL,
        task TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        date TEXT,
        assignee TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
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
    return await db.insert(
      'tasks',
      task.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
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
    return await db.delete(
      'tasks',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<void> updateSyncStatus(int id, String status) async {
    final db = await database;
    await db.update(
      'tasks',
      {'sync_status': status},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<Task>> getUnsyncedTasks() async {
    final db = await database;
    final maps = await db.query(
      'tasks',
      where: 'sync_status != ?',
      whereArgs: ['synced'],
    );
    return maps.map((map) => Task.fromMap(map)).toList();
  }

  Future<void> clearAllTasks() async {
    final db = await database;
    await db.delete('tasks');
  }
}
