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
      pinned: json['pinned'] ?? false,
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

  // For SQLite operations
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'project': project,
      'task': task,
      'priority': priority,
      'status': status,
      'date': date,
      'assignee': assignee,
      'pinned': pinned ? 1 : 0,
    };
  }

  factory Task.fromMap(Map<String, dynamic> map) {
    return Task(
      id: map['id'],
      project: map['project'],
      task: map['task'],
      priority: map['priority'],
      status: map['status'],
      date: map['date'],
      assignee: map['assignee'],
      pinned: map['pinned'] == 1,
    );
  }

  // For optimistic updates
  Task copyWith({
    int? id,
    String? project,
    String? task,
    String? priority,
    String? status,
    String? date,
    String? assignee,
    bool? pinned,
  }) {
    return Task(
      id: id ?? this.id,
      project: project ?? this.project,
      task: task ?? this.task,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      date: date ?? this.date,
      assignee: assignee ?? this.assignee,
      pinned: pinned ?? this.pinned,
    );
  }
}
