import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AttendanceRecord, SubjectConfig } from '@/types/attendance';
import { Check, X } from 'lucide-react';

interface AttendanceFormProps {
  date: Date;
  dayConfig: { total: number; subjects: { [subject: string]: number } };
  subjects: { [key: string]: SubjectConfig };
  existingRecord?: AttendanceRecord;
  onSubmit: (date: Date, subjectAttendance: { [subject: string]: boolean }) => void;
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
  const [subjectAttendance, setSubjectAttendance] = useState<{ [subject: string]: boolean }>({});

  useEffect(() => {
    // Initialize subject attendance based on existing record or all false
    const initialAttendance: { [subject: string]: boolean } = {};
    
    Object.keys(dayConfig.subjects).forEach(subject => {
      initialAttendance[subject] = existingRecord?.subjectAttendance?.[subject] || false;
    });
    
    setSubjectAttendance(initialAttendance);
  }, [dayConfig, existingRecord]);

  const toggleSubject = (subject: string) => {
    setSubjectAttendance(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  const handleSubmit = () => {
    onSubmit(date, subjectAttendance);
  };

  const setAllPresent = () => {
    const allPresent: { [subject: string]: boolean } = {};
    Object.keys(dayConfig.subjects).forEach(subject => {
      allPresent[subject] = true;
    });
    setSubjectAttendance(allPresent);
  };

  const setAllAbsent = () => {
    const allAbsent: { [subject: string]: boolean } = {};
    Object.keys(dayConfig.subjects).forEach(subject => {
      allAbsent[subject] = false;
    });
    setSubjectAttendance(allAbsent);
  };

  const presentCount = Object.values(subjectAttendance).filter(Boolean).length;
  const totalSubjects = Object.keys(dayConfig.subjects).length;
  const percentage = totalSubjects > 0 ? (presentCount / totalSubjects) * 100 : 0;

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

      {/* Subject Grid */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Mark attendance for each subject ({presentCount}/{totalSubjects})
        </Label>
        
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(dayConfig.subjects).map(([subject, count]) => (
            <button
              key={subject}
              type="button"
              onClick={() => toggleSubject(subject)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 font-medium text-left
                ${subjectAttendance[subject]
                  ? 'bg-attendance-present text-white border-attendance-present shadow-md'
                  : 'bg-background border-calendar-border hover:bg-calendar-hover'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{subject}</div>
                  <div className="text-sm opacity-75">{subjects[subject]?.fullName}</div>
                  <div className="text-xs opacity-60">{count} lecture{count > 1 ? 's' : ''}</div>
                </div>
                {subjectAttendance[subject] && (
                  <Check className="h-5 w-5" />
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
              {presentCount} out of {totalSubjects} subjects attended
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