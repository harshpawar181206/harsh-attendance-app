import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export const RealTimeClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Clock className="h-4 w-4" />
      <div className="flex flex-col items-center">
        <div>{format(currentTime, 'EEEE, MMMM d, yyyy')}</div>
        <div className="font-mono">{format(currentTime, 'HH:mm:ss')}</div>
      </div>
    </div>
  );
};