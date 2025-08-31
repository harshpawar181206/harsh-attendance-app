import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceRecord, DayLectureConfig, AttendanceStatus, CalendarDay, SubjectConfig } from '@/types/attendance';
import { AttendanceForm } from './AttendanceForm';
import { RealTimeClock } from './RealTimeClock';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const SUBJECTS: { [key: string]: SubjectConfig } = {
  OOM: { name: 'OOM', fullName: 'Object Oriented Methodology', color: 'bg-black dark:bg-white' },
  SE: { name: 'SE', fullName: 'Software Engineering', color: 'bg-green-500' },
  DBMS: { name: 'DBMS', fullName: 'Database Management Systems', color: 'bg-purple-500' },
  NLDS: { name: 'NLDS', fullName: 'Network & Linux for Data Science', color: 'bg-orange-500' },
  SBC: { name: 'SBC', fullName: 'Smart Business Computing', color: 'bg-pink-500' },
  MOM: { name: 'MOM', fullName: 'Management & Organization Methods', color: 'bg-teal-500' },
  IKS: { name: 'IKS', fullName: 'Indian Knowledge Systems', color: 'bg-yellow-500' }
};

const LECTURE_CONFIG: DayLectureConfig = {
  0: { total: 0, subjects: {} }, // Sunday - no lectures
  1: { total: 4, subjects: { OOM: 1, SE: 1, DBMS: 2 } }, // Monday
  2: { total: 5, subjects: { OOM: 3, NLDS: 1, SE: 1 } }, // Tuesday  
  3: { total: 5, subjects: { SBC: 2, DBMS: 1, MOM: 1, NLDS: 1 } }, // Wednesday
  4: { total: 6, subjects: { NLDS: 3, MOM: 1, OOM: 1, DBMS: 1 } }, // Thursday
  5: { total: 5, subjects: { IKS: 1, SE: 2, MOM: 1, DBMS: 1 } }, // Friday
  6: { total: 0, subjects: {} }, // Saturday - no lectures
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AttendanceCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Scroll animation hook
  const { elementRef: calendarRef, isVisible: calendarVisible } = useScrollAnimation<HTMLDivElement>();

  // Load attendance records from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('attendanceRecords');
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save attendance records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const getAttendanceStatus = (date: Date): AttendanceStatus => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === dateStr);
    
    if (isToday(date) && !record) {
      return 'today';
    }
    
    if (!record) {
      return 'empty';
    }
    
    const percentage = (record.present / record.total) * 100;
    
    if (percentage === 100) return 'present';
    if (percentage === 0) return 'absent';
    return 'partial';
  };

  const handleAttendanceSubmit = (date: Date, lectureAttendance: { [lectureId: string]: boolean }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    const dayConfig = LECTURE_CONFIG[dayOfWeek];
    
    // Calculate total lectures attended
    const presentCount = Object.values(lectureAttendance).filter(Boolean).length;
    
    // Convert lecture attendance back to subject attendance for compatibility
    const subjectAttendance: { [subject: string]: boolean } = {};
    Object.keys(dayConfig.subjects).forEach(subject => {
      // A subject is marked present if ANY of its lectures are attended
      const subjectLectures = Object.entries(lectureAttendance)
        .filter(([lectureId]) => lectureId.startsWith(subject + '-'));
      subjectAttendance[subject] = subjectLectures.some(([, isPresent]) => isPresent);
    });
    
    const newRecord: AttendanceRecord = { 
      date: dateStr, 
      present: presentCount, 
      total: dayConfig.total,
      subjectAttendance,
      lectureAttendance 
    };
    
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.date !== dateStr);
      const updated = [...filtered, newRecord];
      
      // Save to localStorage immediately
      localStorage.setItem('attendanceRecords', JSON.stringify(updated));
      
      // Trigger a custom event to immediately update statistics
      window.dispatchEvent(new CustomEvent('attendanceUpdated', { detail: updated }));
      
      return updated;
    });
    
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleAttendanceDelete = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    setAttendanceRecords(prev => {
      const updated = prev.filter(r => r.date !== dateKey);
      
      // Save to localStorage immediately
      localStorage.setItem('attendanceRecords', JSON.stringify(updated));
      
      // Trigger a custom event to immediately update statistics
      window.dispatchEvent(new CustomEvent('attendanceUpdated', { detail: updated }));
      
      return updated;
    });
    
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    const dayOfWeek = getDay(date);
    const totalLectures = LECTURE_CONFIG[dayOfWeek].total;
    
    if (totalLectures === 0) return; // No lectures on this day
    
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the calendar to start on Sunday
  const firstDayOfWeek = getDay(monthStart);
  const paddedDays: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...monthDays
  ];

  const getDateClassName = (date: Date | null) => {
    if (!date) return 'invisible';
    
    const dayOfWeek = getDay(date);
    const totalLectures = LECTURE_CONFIG[dayOfWeek].total;
    const status = getAttendanceStatus(date);
    
    const baseClasses = 'aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-300 border-2 calendar-day-hover';
    
    if (totalLectures === 0) {
      return cn(baseClasses, 'text-muted-foreground border-transparent cursor-not-allowed opacity-50');
    }
    
    const statusClasses = {
      today: 'bg-attendance-today text-white border-attendance-today shadow-lg hover:shadow-xl cursor-pointer hover:scale-110',
      present: 'bg-attendance-present text-white border-attendance-present hover:opacity-90 cursor-pointer hover:scale-105',
      absent: 'bg-attendance-absent text-white border-attendance-absent hover:opacity-90 cursor-pointer hover:scale-105',
      partial: 'bg-attendance-partial text-white border-attendance-partial hover:opacity-90 cursor-pointer hover:scale-105',
      empty: 'bg-attendance-empty border-calendar-border hover:bg-calendar-hover cursor-pointer hover:scale-105'
    };
    
    return cn(baseClasses, statusClasses[status]);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <Card 
      ref={calendarRef}
      className={`w-full max-w-4xl mx-auto shadow-calendar bg-gradient-accent card-hover scroll-animate-scale ${calendarVisible ? 'animate-in' : ''}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gradient text-shadow">
              <CalendarIcon className="h-6 w-6 text-primary animate-pulse" />
              Attendance Calendar
            </CardTitle>
            <RealTimeClock />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 button-hover"
            >
              ←
            </Button>
            <h3 className="font-semibold text-lg min-w-[140px] text-center text-shadow-sm">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 button-hover"
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-4 h-4 rounded bg-attendance-today shadow-sm"></div>
            <span className="font-medium">Today</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-4 h-4 rounded bg-attendance-present shadow-sm"></div>
            <span className="font-medium">Full Attendance</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-4 h-4 rounded bg-attendance-partial shadow-sm"></div>
            <span className="font-medium">Partial Attendance</span>
          </div>
          <div className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="w-4 h-4 rounded bg-attendance-absent shadow-sm"></div>
            <span className="font-medium">Absent</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAYS_OF_WEEK.map((day, index) => (
            <div 
              key={day} 
              className="text-center text-sm font-semibold text-muted-foreground py-2 animate-fade-in text-shadow-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {paddedDays.map((date, index) => (
            <button
              key={index}
              className={getDateClassName(date)}
              onClick={() => date && handleDateClick(date)}
              disabled={!date || LECTURE_CONFIG[getDay(date)].total === 0}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              {date ? format(date, 'd') : ''}
            </button>
          ))}
        </div>

        {/* Attendance Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
              <DialogTitle className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Mark Attendance for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</span>
                  {selectedDate && attendanceRecords.find(r => r.date === format(selectedDate, 'yyyy-MM-dd')) && (
                    <span className="text-sm text-green-600 font-medium">✓ Previously Saved (Click to Edit)</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Select individual lectures to mark as present. Unselected lectures will be marked as absent.
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDate && (
                <AttendanceForm
                   date={selectedDate}
                   dayConfig={LECTURE_CONFIG[getDay(selectedDate)]}
                   subjects={SUBJECTS}
                   existingRecord={attendanceRecords.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'))}
                   onSubmit={handleAttendanceSubmit}
                   onDelete={handleAttendanceDelete}
                   onCancel={() => setIsDialogOpen(false)}
                 />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};