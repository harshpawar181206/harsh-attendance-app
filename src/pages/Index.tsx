import React from 'react';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { AttendanceStatistics } from '@/components/AttendanceStatistics';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AcademiaTrack</h1>
          <p className="text-muted-foreground">Attendance Management System</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          <AttendanceCalendar />
          <AttendanceStatistics />
        </div>
      </div>
    </div>
  );
};

export default Index;
