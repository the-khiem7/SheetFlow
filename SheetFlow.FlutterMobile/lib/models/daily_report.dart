class DailyReport {
  final String date;
  final String goals;
  final String finished;

  DailyReport({
    required this.date,
    required this.goals,
    required this.finished,
  });

  factory DailyReport.fromJson(Map<String, dynamic> json) {
    return DailyReport(
      date: json['date'],
      goals: json['goals'],
      finished: json['finished'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'goals': goals,
      'finished': finished,
    };
  }
}
