import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AttendanceRecord, SubjectConfig } from '@/types/attendance';
import { Check, X } from 'lucide-react';

interface LectureAttendance {
  [lectureId: string]: boolean;
}

interface AttendanceFormProps {
  date: Date;
  dayConfig: { total: number; subjects: { [subject: string]: number } };
  subjects: { [key: string]: SubjectConfig };
  existingRecord?: AttendanceRecord;
  onSubmit: (date: Date, lectureAttendance: LectureAttendance) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  date,
  dayConfig,
  subjects,
  existingRecord,
  onSubmit,
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
    setLectureAttendance(prev => ({
      ...prev,
      [lectureId]: !prev[lectureId]
    }));
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

  const presentCount = Object.values(lectureAttendance).filter(Boolean).length;
  const totalLectures = lectures.length;
  const percentage = totalLectures > 0 ? (presentCount / totalLectures) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={setAllPresent}
          className="flex-1"
        >
          <Check className="h-4 w-4 mr-1" />
          All Present
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={setAllAbsent}
          className="flex-1"
        >
          <X className="h-4 w-4 mr-1" />
          All Absent
        </Button>
      </div>

      {/* Individual Lectures Grid */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Mark attendance for each lecture ({presentCount}/{totalLectures})
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          {lectures.map((lecture) => (
            <button
              key={lecture.id}
              type="button"
              onClick={() => toggleLecture(lecture.id)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 font-medium text-left
                ${lectureAttendance[lecture.id]
                  ? 'bg-green-500 text-white border-green-500 shadow-md'
                  : 'bg-background border-border hover:bg-accent'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{lecture.subject}</div>
                  <div className="text-xs opacity-75">
                    Lecture {lecture.lectureNumber}
                  </div>
                  <div className="text-xs opacity-60">
                    {subjects[lecture.subject]?.fullName}
                  </div>
                </div>
                {lectureAttendance[lecture.id] && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-accent">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {presentCount} out of {totalLectures} lectures attended
            </div>
            <div className={`text-sm font-medium ${
              percentage === 100 ? 'text-attendance-present' : 
              percentage === 0 ? 'text-attendance-absent' : 
              'text-attendance-partial'
            }`}>
              {percentage === 100 ? 'Full Attendance' :
               percentage === 0 ? 'Absent' : 'Partial Attendance'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-background pt-4 mt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-semibold"
          >
            💾 Save Today
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          You can edit this day's attendance anytime by clicking on the date again
        </div>
      </div>
    </div>
  );
};