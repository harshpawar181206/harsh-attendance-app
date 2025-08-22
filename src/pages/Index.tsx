import React from 'react';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { AttendanceStatistics } from '@/components/AttendanceStatistics';
import { GraduationCap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AcademiaTrack
              </h1>
              <p className="text-muted-foreground">Smart Attendance Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Calendar Section */}
        <section>
          <AttendanceCalendar />
        </section>

        {/* Statistics Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📊 Analytics & Insights
          </h2>
          <AttendanceStatistics />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; 2024 AcademiaTrack. Built for academic excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
