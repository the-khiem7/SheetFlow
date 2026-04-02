import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/task_provider.dart';
import '../models/task.dart';
import '../theme/colors.dart';
import '../widgets/task_card.dart';
import '../widgets/task_form_dialog.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  String _filterStatus = 'all';
  String _filterProject = 'all';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SheetFlow Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<TaskProvider>().refreshTasks(),
          ),
          PopupMenuButton<String>(
            onSelected: (value) => setState(() => _filterStatus = value),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'all', child: Text('All Tasks')),
              const PopupMenuItem(value: 'pending', child: Text('Pending')),
              const PopupMenuItem(value: 'in-progress', child: Text('In Progress')),
              const PopupMenuItem(value: 'finished', child: Text('Finished')),
            ],
          ),
        ],
      ),
      body: Consumer<TaskProvider>(
        builder: (context, taskProvider, child) {
          if (taskProvider.isLoading && taskProvider.tasks.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (taskProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Error: ${taskProvider.error}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      taskProvider.clearError();
                      taskProvider.loadTasks();
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final filteredTasks = _getFilteredTasks(taskProvider.tasks);

          if (filteredTasks.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.task_alt,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    taskProvider.tasks.isEmpty
                        ? 'No tasks yet. Create your first task!'
                        : 'No tasks match the current filters.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: taskProvider.refreshTasks,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredTasks.length,
              itemBuilder: (context, index) {
                final task = filteredTasks[index];
                return TaskCard(
                  task: task,
                  onTap: () => _showTaskFormDialog(context, task),
                  onDelete: () => _showDeleteConfirmation(context, task),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showTaskFormDialog(context, null),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add),
      ),
    );
  }

  List<Task> _getFilteredTasks(List<Task> tasks) {
    return tasks.where((task) {
      final statusMatch = _filterStatus == 'all' || task.status == _filterStatus;
      final projectMatch = _filterProject == 'all' || task.project == _filterProject;
      return statusMatch && projectMatch;
    }).toList();
  }

  void _showTaskFormDialog(BuildContext context, Task? task) {
    showDialog(
      context: context,
      builder: (context) => TaskFormDialog(task: task),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Task task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: Text('Are you sure you want to delete "${task.task}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              context.read<TaskProvider>().deleteTask(task.id);
              Navigator.of(context).pop();
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
