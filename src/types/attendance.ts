export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  present: number;
  total: number;
  subjectAttendance?: { [subject: string]: boolean }; // Track individual subjects
  lectureAttendance?: { [lectureId: string]: boolean }; // Track individual lectures
}

export interface DayLectureConfig {
  [key: number]: { total: number; subjects: { [subject: string]: number } };
}

export interface SubjectConfig {
  name: string;
  fullName: string;
  color: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'partial' | 'today' | 'empty';

export interface CalendarDay {
  date: Date;
  status: AttendanceStatus;
  present?: number;
  total?: number;
}