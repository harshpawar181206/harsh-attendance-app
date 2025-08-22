export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  present: number;
  total: number;
}

export interface DayLectureConfig {
  [key: number]: number; // day of week (0-6) -> number of lectures
}

export type AttendanceStatus = 'present' | 'absent' | 'partial' | 'today' | 'empty';

export interface CalendarDay {
  date: Date;
  status: AttendanceStatus;
  present?: number;
  total?: number;
}