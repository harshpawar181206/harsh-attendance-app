import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AttendanceRecord, SubjectConfig } from '@/types/attendance';
import { Check, X, Save, Trash2, RotateCcw } from 'lucide-react';

interface LectureAttendance {
  [lectureId: string]: boolean;
}

interface AttendanceFormProps {
  date: Date;
  dayConfig: { total: number; subjects: { [subject: string]: number } };
  subjects: { [key: string]: SubjectConfig };
  existingRecord?: AttendanceRecord;
  onSubmit: (date: Date, lectureAttendance: LectureAttendance) => void;
  onDelete: (date: Date) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  date,
  dayConfig,
  subjects,
  existingRecord,
  onSubmit,
  onDelete,
  onCancel
}) => {
  const [lectureAttendance, setLectureAttendance] = useState<LectureAttendance>({});

  // Generate individual lectures
  const generateLectures = () => {
    const lectures: { id: string; subject: string; lectureNumber: number }[] = [];
    Object.entries(dayConfig.subjects).forEach(([subject, count]) => {
      for (let i = 1; i <= count; i++) {
        lectures.push({
          id: `${subject}-${i}`,
          subject,
          lectureNumber: i
        });
      }
    });
    return lectures;
  };

  const lectures = generateLectures();

  useEffect(() => {
    // Initialize lecture attendance based on existing record or all false
    const initialAttendance: LectureAttendance = {};
    
    lectures.forEach(lecture => {
      // If we have existing lecture attendance, use that; otherwise fall back to subject attendance
      if (existingRecord?.lectureAttendance) {
        initialAttendance[lecture.id] = existingRecord.lectureAttendance[lecture.id] || false;
      } else {
        // Convert from subject-based to lecture-based attendance
        initialAttendance[lecture.id] = existingRecord?.subjectAttendance?.[lecture.subject] || false;
      }
    });
    
    setLectureAttendance(initialAttendance);
  }, [dayConfig, existingRecord]);

  const toggleLecture = (lectureId: string) => {
    setLectureAttendance(prev => {
      const currentValue = prev[lectureId];
      // Cycle: undefined -> true -> false -> true -> false...
      if (currentValue === undefined) {
        return { ...prev, [lectureId]: true };
      } else if (currentValue === true) {
        return { ...prev, [lectureId]: false };
      } else {
        return { ...prev, [lectureId]: true };
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(date, lectureAttendance);
  };

  const setAllPresent = () => {
    const allPresent: LectureAttendance = {};
    lectures.forEach(lecture => {
      allPresent[lecture.id] = true;
    });
    setLectureAttendance(allPresent);
  };

  const setAllAbsent = () => {
    const allAbsent: LectureAttendance = {};
    lectures.forEach(lecture => {
      allAbsent[lecture.id] = false;
    });
    setLectureAttendance(allAbsent);
  };

  const getPresentCount = () => {
    return Object.values(lectureAttendance).filter(Boolean).length;
  };

  const getAbsentCount = () => {
    return Object.values(lectureAttendance).filter(value => value === false).length;
  };

  const getUnmarkedCount = () => {
    return Object.values(lectureAttendance).filter(value => value === undefined).length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover bg-gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-attendance-present text-shadow">{getPresentCount()}</div>
            <div className="text-sm text-muted-foreground font-medium">Present</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-attendance-absent text-shadow">{getAbsentCount()}</div>
            <div className="text-sm text-muted-foreground font-medium">Absent</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground text-shadow-sm">{getUnmarkedCount()}</div>
            <div className="text-sm text-muted-foreground font-medium">Unmarked</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={setAllPresent}
          variant="outline"
          size="sm"
          className="button-hover hover:bg-attendance-present hover:text-white transition-all duration-300 font-semibold"
        >
          <Check className="h-4 w-4 mr-2" />
          Mark All Present
        </Button>
        
        <Button
          onClick={setAllAbsent}
          variant="outline"
          size="sm"
          className="button-hover hover:bg-attendance-absent hover:text-white transition-all duration-300 font-semibold"
        >
          <X className="h-4 w-4 mr-2" />
          Mark All Absent
        </Button>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lectures.map((lecture, index) => {
          const isPresent = lectureAttendance[lecture.id];
          const subjectConfig = subjects[lecture.subject];
          
          return (
            <Card 
              key={lecture.id} 
              className={`card-hover cursor-pointer transition-all duration-300 ${
                isPresent === true 
                  ? 'ring-2 ring-attendance-present bg-attendance-present/10' 
                  : isPresent === false 
                  ? 'ring-2 ring-attendance-absent bg-attendance-absent/10'
                  : 'ring-2 ring-muted-foreground/30'
              }`}
              onClick={() => toggleLecture(lecture.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${subjectConfig.color} mr-2`}></div>
                  <span className="font-semibold text-sm">{lecture.subject}</span>
                </div>
                
                <div className="text-lg font-bold mb-2 text-shadow-sm">
                  Lecture {lecture.lectureNumber}
                </div>
                
                <div className="flex items-center justify-center">
                  {isPresent === true && (
                    <Check className="h-6 w-6 text-attendance-present animate-bounce-in" />
                  )}
                  {isPresent === false && (
                    <X className="h-6 w-6 text-attendance-absent animate-bounce-in" />
                  )}
                  {isPresent === undefined && (
                    <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full"></div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 font-medium">
                  {isPresent === true ? 'Present' : isPresent === false ? 'Absent' : 'Click to mark'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end pt-4 border-t">
        {existingRecord && (
          <Button
            onClick={() => onDelete(date)}
            variant="outline"
            className="button-hover hover:bg-destructive hover:text-white transition-all duration-300 font-semibold"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Record
          </Button>
        )}
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="button-hover font-semibold"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="button-hover bg-primary hover:bg-primary/90 text-white font-semibold"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Attendance
        </Button>
      </div>
    </div>
  );
};