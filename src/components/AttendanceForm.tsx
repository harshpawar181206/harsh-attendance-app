import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AttendanceRecord } from '@/types/attendance';
import { Check, X } from 'lucide-react';

interface AttendanceFormProps {
  date: Date;
  totalLectures: number;
  existingRecord?: AttendanceRecord;
  onSubmit: (date: Date, present: number, total: number) => void;
  onCancel: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  date,
  totalLectures,
  existingRecord,
  onSubmit,
  onCancel
}) => {
  const [lectureStatus, setLectureStatus] = useState<boolean[]>([]);

  useEffect(() => {
    // Initialize lecture status based on existing record or all false
    const initialStatus = Array(totalLectures).fill(false);
    
    if (existingRecord) {
      // Mark first 'present' lectures as true
      for (let i = 0; i < existingRecord.present; i++) {
        initialStatus[i] = true;
      }
    }
    
    setLectureStatus(initialStatus);
  }, [totalLectures, existingRecord]);

  const toggleLecture = (index: number) => {
    setLectureStatus(prev => {
      const newStatus = [...prev];
      newStatus[index] = !newStatus[index];
      return newStatus;
    });
  };

  const handleSubmit = () => {
    const presentCount = lectureStatus.filter(Boolean).length;
    onSubmit(date, presentCount, totalLectures);
  };

  const setAllPresent = () => {
    setLectureStatus(Array(totalLectures).fill(true));
  };

  const setAllAbsent = () => {
    setLectureStatus(Array(totalLectures).fill(false));
  };

  const presentCount = lectureStatus.filter(Boolean).length;
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

      {/* Lecture Grid */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Mark attendance for each lecture ({presentCount}/{totalLectures})
        </Label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: totalLectures }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleLecture(index)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 font-medium
                ${lectureStatus[index]
                  ? 'bg-attendance-present text-white border-attendance-present shadow-md'
                  : 'bg-background border-calendar-border hover:bg-calendar-hover'
                }
              `}
            >
              Lecture {index + 1}
              {lectureStatus[index] && (
                <Check className="h-4 w-4 ml-1 inline" />
              )}
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
      <div className="flex gap-3 pt-2">
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
          className="flex-1 bg-gradient-primary"
        >
          Save Attendance
        </Button>
      </div>
    </div>
  );
};