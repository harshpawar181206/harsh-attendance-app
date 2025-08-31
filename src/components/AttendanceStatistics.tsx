import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Target, 
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { AttendanceRecord } from '@/types/attendance';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const AttendanceStatistics: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentMonth] = useState(new Date());

  // Scroll animation hooks
  const { elementRef: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>();
  const { elementRef: cardsRef, isVisible: cardsVisible } = useScrollAnimation<HTMLDivElement>();
  const { elementRef: detailsRef, isVisible: detailsVisible } = useScrollAnimation<HTMLDivElement>();

  // Listen for changes in localStorage
  useEffect(() => {
    const loadRecords = () => {
      const savedRecords = localStorage.getItem('attendanceRecords');
      if (savedRecords) {
        setAttendanceRecords(JSON.parse(savedRecords));
      }
    };

    // Initial load
    loadRecords();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'attendanceRecords') {
        loadRecords();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for focus events to catch same-tab updates
    const handleFocus = () => {
      loadRecords();
    };

    window.addEventListener('focus', handleFocus);

    // Check for updates every second (fallback)
    const interval = setInterval(loadRecords, 1000);

    // Listen for custom attendance update events for immediate updates
    const handleAttendanceUpdate = (e: CustomEvent) => {
      setAttendanceRecords(e.detail);
    };

    window.addEventListener('attendanceUpdated', handleAttendanceUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('attendanceUpdated', handleAttendanceUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Calculate overall statistics
  const totalLectures = attendanceRecords.reduce((sum, record) => sum + record.total, 0);
  const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.present, 0);
  const overallPercentage = totalLectures > 0 ? (totalPresent / totalLectures) * 100 : 0;

  // Calculate current month statistics
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const currentMonthRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
  });

  const monthlyTotalLectures = currentMonthRecords.reduce((sum, record) => sum + record.total, 0);
  const monthlyTotalPresent = currentMonthRecords.reduce((sum, record) => sum + record.present, 0);
  const monthlyPercentage = monthlyTotalLectures > 0 ? (monthlyTotalPresent / monthlyTotalLectures) * 100 : 0;

  // Attendance streaks and patterns
  const fullAttendanceDays = attendanceRecords.filter(record => 
    record.present === record.total && record.total > 0
  ).length;

  const absentDays = attendanceRecords.filter(record => 
    record.present === 0 && record.total > 0
  ).length;

  const partialDays = attendanceRecords.filter(record => 
    record.present > 0 && record.present < record.total
  ).length;

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-attendance-present' };
    if (percentage >= 80) return { label: 'Good', color: 'bg-primary' };
    if (percentage >= 70) return { label: 'Fair', color: 'bg-attendance-partial' };
    if (percentage >= 60) return { label: 'Needs Improvement', color: 'bg-attendance-absent' };
    return { label: 'Poor', color: 'bg-destructive' };
  };

  const overallPerformance = getPerformanceLabel(overallPercentage);
  const monthlyPerformance = getPerformanceLabel(monthlyPercentage);

  return (
    <div ref={statsRef} className={`space-y-6 scroll-animate ${statsVisible ? 'animate-in' : ''}`}>
      {/* Overall Statistics */}
      <div ref={cardsRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-animate ${cardsVisible ? 'animate-in' : ''}`}>
        {/* Overall Attendance */}
        <Card className="card-hover animate-fade-in bg-gradient-accent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-shadow-sm">
              <Target className="h-5 w-5 text-primary" />
              Overall Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gradient text-shadow">
                {overallPercentage.toFixed(1)}%
              </div>
              <Progress value={overallPercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Present: {totalPresent}</span>
                <span className="text-muted-foreground font-medium">Total: {totalLectures}</span>
              </div>
              <Badge className={`${overallPerformance.color} text-white hover:scale-105 transition-transform font-semibold`}>
                {overallPerformance.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Attendance */}
        <Card className="card-hover animate-fade-in bg-gradient-accent" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-shadow-sm">
              <CalendarIcon className="h-5 w-5 text-primary" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-gradient text-shadow">
                {monthlyPercentage.toFixed(1)}%
              </div>
              <Progress value={monthlyPercentage} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Present: {monthlyTotalPresent}</span>
                <span className="text-muted-foreground font-medium">Total: {monthlyTotalLectures}</span>
              </div>
              <Badge className={`${monthlyPerformance.color} text-white hover:scale-105 transition-transform font-semibold`}>
                {monthlyPerformance.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Patterns */}
        <Card className="card-hover animate-fade-in bg-gradient-accent" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-shadow-sm">
              <TrendingUp className="h-5 w-5 text-primary" />
              Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-attendance-present" />
                <span className="text-sm font-medium">Full Days: {fullAttendanceDays}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-attendance-partial" />
                <span className="text-sm font-medium">Partial Days: {partialDays}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-attendance-absent" />
                <span className="text-sm font-medium">Absent Days: {absentDays}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="card-hover animate-fade-in bg-gradient-accent" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-shadow-sm">
              <Award className="h-5 w-5 text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overallPercentage >= 90 && (
                <div className="text-sm text-attendance-present font-semibold text-shadow-sm">
                  🎉 Outstanding performance! Keep it up!
                </div>
              )}
              {overallPercentage >= 80 && overallPercentage < 90 && (
                <div className="text-sm text-primary font-semibold text-shadow-sm">
                  👍 Great work! You're on track for excellence.
                </div>
              )}
              {overallPercentage >= 70 && overallPercentage < 80 && (
                <div className="text-sm text-attendance-partial font-semibold text-shadow-sm">
                  📈 Good progress! Aim for 80%+ next month.
                </div>
              )}
              {overallPercentage < 70 && (
                <div className="text-sm text-attendance-absent font-semibold text-shadow-sm">
                  💪 Room for improvement. Focus on consistency.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div ref={detailsRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-animate ${detailsVisible ? 'animate-in' : ''}`}>
        {/* Subject-wise Breakdown */}
        <Card className="card-hover animate-slide-up bg-gradient-accent" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold text-shadow-sm">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(SUBJECTS).map(([subject, config]) => {
                const subjectRecords = attendanceRecords.filter(record => 
                  record.subjectAttendance && record.subjectAttendance[subject]
                );
                const totalDays = subjectRecords.length;
                const presentDays = subjectRecords.filter(record => 
                  record.subjectAttendance && record.subjectAttendance[subject]
                ).length;
                const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

                return (
                  <div key={subject} className="space-y-2 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                        <span className="font-semibold">{config.name}</span>
                        <span className="text-sm text-muted-foreground font-medium">({config.fullName})</span>
                      </div>
                      <span className="font-bold text-shadow-sm">{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground font-medium">
                      {presentDays} out of {totalDays} days attended
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card className="card-hover animate-slide-up bg-gradient-accent" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold text-shadow-sm">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
                const dayRecords = attendanceRecords.filter(record => {
                  const recordDate = new Date(record.date);
                  const dayOfWeek = recordDate.getDay();
                  return dayOfWeek === index + 1; // Monday = 1, Tuesday = 2, etc.
                });
                
                const totalLectures = dayRecords.reduce((sum, record) => sum + record.total, 0);
                const presentLectures = dayRecords.reduce((sum, record) => sum + record.present, 0);
                const percentage = totalLectures > 0 ? (presentLectures / totalLectures) * 100 : 0;

                return (
                  <div key={day} className="space-y-2 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{day}</span>
                      <span className="font-bold text-shadow-sm">{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground font-medium">
                      {presentLectures} out of {totalLectures} lectures attended
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock SUBJECTS data for the component
const SUBJECTS: { [key: string]: { name: string; fullName: string; color: string } } = {
  OOM: { name: 'OOM', fullName: 'Object Oriented Methodology', color: 'bg-black dark:bg-white' },
  SE: { name: 'SE', fullName: 'Software Engineering', color: 'bg-green-500' },
  DBMS: { name: 'DBMS', fullName: 'Database Management Systems', color: 'bg-purple-500' },
  NLDS: { name: 'NLDS', fullName: 'Network & Linux for Data Science', color: 'bg-orange-500' },
  SBC: { name: 'SBC', fullName: 'Smart Business Computing', color: 'bg-pink-500' },
  MOM: { name: 'MOM', fullName: 'Management & Organization Methods', color: 'bg-teal-500' },
  IKS: { name: 'IKS', fullName: 'Indian Knowledge Systems', color: 'bg-yellow-500' }
};