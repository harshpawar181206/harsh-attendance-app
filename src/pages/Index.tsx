import React, { useState, useEffect } from 'react';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { AttendanceStatistics } from '@/components/AttendanceStatistics';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Index = () => {
  const [isDark, setIsDark] = useState(false);

  // Scroll animation hooks - properly typed for HTMLDivElement
  const { elementRef: heroRef, isVisible: heroVisible } = useScrollAnimation<HTMLDivElement>();
  const { elementRef: calendarRef, isVisible: calendarVisible } = useScrollAnimation<HTMLDivElement>();
  const { elementRef: statsRef, isVisible: statsVisible } = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    
    // Apply theme to document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial dark:bg-gradient-radial">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="button-hover glass-effect backdrop-blur-sm"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Hero Section with enhanced styling */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/5"></div>
        
        <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
          <div 
            ref={heroRef}
            className={`text-center mb-8 md:mb-16 scroll-animate ${heroVisible ? 'animate-in' : ''}`}
          >
            <div className="inline-block mb-4 animate-bounce-in">
              <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 dark:from-white to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <span className="text-2xl font-bold text-white dark:text-black">A</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient dark:text-white text-shadow-lg">
              AcademiaTrack
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium text-shadow-sm">
              Advanced Attendance Management System with Real-time Analytics
            </p>
            
            {/* Decorative elements */}
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="space-y-8 md:space-y-12">
          {/* Calendar Section */}
          <div 
            ref={calendarRef}
            className={`scroll-animate-left ${calendarVisible ? 'animate-in' : ''}`}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 text-shadow">
                Attendance Calendar
              </h2>
              <p className="text-muted-foreground font-medium text-shadow-sm">
                Track your daily attendance with our interactive calendar
              </p>
            </div>
            <AttendanceCalendar />
          </div>

          {/* Statistics Section */}
          <div 
            ref={statsRef}
            className={`scroll-animate-right ${statsVisible ? 'animate-in' : ''}`}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 text-shadow">
                Performance Analytics
              </h2>
              <p className="text-muted-foreground font-medium text-shadow-sm">
                Comprehensive insights into your attendance patterns
              </p>
            </div>
            <AttendanceStatistics />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">
              © 2024 AcademiaTrack. Built with modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
