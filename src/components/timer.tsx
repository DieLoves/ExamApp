import { useEffect, useState } from "react";
import { Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  className?: string;
}

export function Timer({ initialMinutes, onTimeUp, className }: TimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  useEffect(() => {
    // Warning when less than 25% time remains
    setIsWarning(seconds < initialMinutes * 60 * 0.25);
    // Danger when less than 10% time remains
    setIsDanger(seconds < initialMinutes * 60 * 0.1);
  }, [seconds, initialMinutes]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 font-mono text-lg",
      isWarning && "text-yellow-500",
      isDanger && "text-red-500 animate-pulse",
      className
    )}>
      <Clock className="h-5 w-5" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}

export function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours} ч ${remainingMinutes} мин`;
  } else {
    const remainingSeconds = seconds % 60;
    return `${minutes} мин ${remainingSeconds} сек`;
  }
}
