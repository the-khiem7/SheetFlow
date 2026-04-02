import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/task.dart';
import '../providers/task_provider.dart';
import '../theme/colors.dart';

class TaskFormDialog extends StatefulWidget {
  final Task? task;

  const TaskFormDialog({super.key, this.task});

  @override
  State<TaskFormDialog> createState() => _TaskFormDialogState();
}

class _TaskFormDialogState extends State<TaskFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _taskController;
  late TextEditingController _projectController;
  late TextEditingController _assigneeController;
  late TextEditingController _dateController;
  String _priority = 'Medium';
  String _status = 'Pending';
  bool _pinned = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _taskController = TextEditingController(text: widget.task?.task ?? '');
    _projectController = TextEditingController(text: widget.task?.project ?? '');
    _assigneeController = TextEditingController(text: widget.task?.assignee ?? '');
    _dateController = TextEditingController(text: widget.task?.date ?? '');

    if (widget.task != null) {
      _priority = widget.task!.priority;
      _status = widget.task!.status;
      _pinned = widget.task!.pinned;
    }
  }

  @override
  void dispose() {
    _taskController.dispose();
    _projectController.dispose();
    _assigneeController.dispose();
    _dateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.task != null;

    return AlertDialog(
      title: Text(isEditing ? 'Edit Task' : 'Create Task'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _taskController,
                decoration: const InputDecoration(
                  labelText: 'Task Description',
                  hintText: 'Enter task description',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a task description';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _projectController,
                decoration: const InputDecoration(
                  labelText: 'Project',
                  hintText: 'Enter project name',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a project name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _priority,
                decoration: const InputDecoration(
                  labelText: 'Priority',
                ),
                items: ['Low', 'Medium', 'High']
                    .map((priority) => DropdownMenuItem(
                          value: priority,
                          child: Text(priority),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() => _priority = value!);
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(
                  labelText: 'Status',
                ),
                items: ['Pending', 'In Progress', 'Finished']
                    .map((status) => DropdownMenuItem(
                          value: status,
                          child: Text(status),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() => _status = value!);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _assigneeController,
                decoration: const InputDecoration(
                  labelText: 'Assignee',
                  hintText: 'Enter assignee name',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an assignee';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _dateController,
                decoration: const InputDecoration(
                  labelText: 'Date (optional)',
                  hintText: 'YYYY-MM-DD',
                ),
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                title: const Text('Pin this task'),
                value: _pinned,
                onChanged: (value) {
                  setState(() => _pinned = value ?? false);
                },
                contentPadding: EdgeInsets.zero,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _saveTask,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : Text(isEditing ? 'Update' : 'Create'),
        ),
      ],
    );
  }

  Future<void> _saveTask() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final taskProvider = context.read<TaskProvider>();

      if (widget.task != null) {
        // Update existing task
        final updatedTask = widget.task!.copyWith(
          task: _taskController.text,
          project: _projectController.text,
          priority: _priority,
          status: _status,
          assignee: _assigneeController.text,
          date: _dateController.text.isEmpty ? null : _dateController.text,
          pinned: _pinned,
        );
        await taskProvider.updateTask(updatedTask);
      } else {
        // Create new task
        final newTask = Task(
          id: DateTime.now().millisecondsSinceEpoch, // Temporary ID
          task: _taskController.text,
          project: _projectController.text,
          priority: _priority,
          status: _status,
          assignee: _assigneeController.text,
          date: _dateController.text.isEmpty ? null : _dateController.text,
          pinned: _pinned,
        );
        await taskProvider.addTask(newTask);
      }

      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
