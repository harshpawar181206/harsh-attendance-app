import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { AttendanceRecord, DayLectureConfig, AttendanceStatus, CalendarDay } from '@/types/attendance';
import { AttendanceForm } from './AttendanceForm';
import { cn } from '@/lib/utils';

const LECTURE_CONFIG: DayLectureConfig = {
  0: 0, // Sunday - no lectures
  1: 4, // Monday - 4 lectures
  2: 5, // Tuesday - 5 lectures
  3: 6, // Wednesday - 6 lectures
  4: 6, // Thursday - 6 lectures
  5: 4, // Friday - 4 lectures
  6: 0, // Saturday - no lectures
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AttendanceCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleAttendanceSubmit = (date: Date, present: number, total: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const newRecord: AttendanceRecord = { date: dateStr, present, total };
    
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.date !== dateStr);
      return [...filtered, newRecord];
    });
    
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    const dayOfWeek = getDay(date);
    const totalLectures = LECTURE_CONFIG[dayOfWeek];
    
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
    const totalLectures = LECTURE_CONFIG[dayOfWeek];
    const status = getAttendanceStatus(date);
    
    const baseClasses = 'aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 border-2';
    
    if (totalLectures === 0) {
      return cn(baseClasses, 'text-muted-foreground border-transparent cursor-not-allowed opacity-50');
    }
    
    const statusClasses = {
      today: 'bg-attendance-today text-white border-attendance-today shadow-md hover:bg-primary-glow cursor-pointer',
      present: 'bg-attendance-present text-white border-attendance-present hover:opacity-80 cursor-pointer',
      absent: 'bg-attendance-absent text-white border-attendance-absent hover:opacity-80 cursor-pointer',
      partial: 'bg-attendance-partial text-white border-attendance-partial hover:opacity-80 cursor-pointer',
      empty: 'bg-attendance-empty border-calendar-border hover:bg-calendar-hover cursor-pointer'
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
    <Card className="w-full max-w-4xl mx-auto shadow-calendar bg-gradient-accent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Attendance Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>
            <h3 className="font-semibold text-lg min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-attendance-today"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-attendance-present"></div>
            <span>Full Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-attendance-partial"></div>
            <span>Partial Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-attendance-absent"></div>
            <span>Absent</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {paddedDays.map((date, index) => (
            <button
              key={index}
              className={getDateClassName(date)}
              onClick={() => date && handleDateClick(date)}
              disabled={!date || LECTURE_CONFIG[getDay(date)] === 0}
            >
              {date ? format(date, 'd') : ''}
            </button>
          ))}
        </div>

        {/* Attendance Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Mark Attendance for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            {selectedDate && (
              <AttendanceForm
                date={selectedDate}
                totalLectures={LECTURE_CONFIG[getDay(selectedDate)]}
                existingRecord={attendanceRecords.find(r => r.date === format(selectedDate, 'yyyy-MM-dd'))}
                onSubmit={handleAttendanceSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};