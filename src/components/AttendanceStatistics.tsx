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

export const AttendanceStatistics: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    const savedRecords = localStorage.getItem('attendanceRecords');
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords));
    }
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
    if (percentage >= 70) return { label: 'Average', color: 'bg-attendance-partial' };
    if (percentage >= 60) return { label: 'Below Average', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-attendance-absent' };
  };

  const overallPerformance = getPerformanceLabel(overallPercentage);
  const monthlyPerformance = getPerformanceLabel(monthlyPercentage);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold">{overallPercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className={overallPerformance.color}>
                {overallPerformance.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{monthlyPercentage.toFixed(1)}%</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className={monthlyPerformance.color}>
                {monthlyPerformance.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lectures</p>
                <p className="text-2xl font-bold">{totalLectures}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {totalPresent} attended
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perfect Days</p>
                <p className="text-2xl font-bold">{fullAttendanceDays}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              100% attendance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Attendance</span>
                <span className="text-sm text-muted-foreground">{overallPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={overallPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Attendance</span>
                <span className="text-sm text-muted-foreground">{monthlyPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={monthlyPercentage} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Target: 75% • Current Month: {format(currentMonth, 'MMMM yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Attendance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-attendance-present" />
                <span className="text-sm">Perfect Attendance Days</span>
              </div>
              <span className="font-semibold">{fullAttendanceDays}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-attendance-partial" />
                <span className="text-sm">Partial Attendance Days</span>
              </div>
              <span className="font-semibold">{partialDays}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-attendance-absent" />
                <span className="text-sm">Absent Days</span>
              </div>
              <span className="font-semibold">{absentDays}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Total recorded days: {attendanceRecords.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};