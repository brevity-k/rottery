'use client';

import { useState, useEffect } from 'react';
import { getNextDrawDate, type NextDrawInfo } from '@/lib/utils/drawSchedule';

interface DrawCountdownProps {
  drawDays: string[];
  drawTime: string;
  retiredDate?: string;
  variant?: 'hero' | 'compact';
  colorClass?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function formatTimeLeft(t: TimeLeft): string {
  if (t.days > 0) return `${t.days}d ${t.hours}h ${t.minutes}m ${t.seconds}s`;
  if (t.hours > 0) return `${t.hours}h ${t.minutes}m ${t.seconds}s`;
  if (t.minutes > 0) return `${t.minutes}m ${t.seconds}s`;
  return `${t.seconds}s`;
}

export default function DrawCountdown({
  drawDays,
  drawTime,
  retiredDate,
  variant = 'compact',
  colorClass,
}: DrawCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [drawInfo, setDrawInfo] = useState<NextDrawInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    const info = getNextDrawDate({ drawDays, drawTime, retiredDate });
    setDrawInfo(info);
    if (info && !info.isRetired) {
      setTimeLeft(getTimeLeft(info.date));
    }
  }, [drawDays, drawTime, retiredDate]);

  useEffect(() => {
    if (!drawInfo || drawInfo.isRetired) return;

    const interval = setInterval(() => {
      const t = getTimeLeft(drawInfo.date);
      setTimeLeft(t);

      // If countdown finished, recalculate next draw
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        const newInfo = getNextDrawDate({ drawDays, drawTime, retiredDate });
        setDrawInfo(newInfo);
        if (newInfo && !newInfo.isRetired) {
          setTimeLeft(getTimeLeft(newInfo.date));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [drawInfo, drawDays, drawTime, retiredDate]);

  // SSR placeholder
  if (!mounted) {
    if (variant === 'hero') {
      return <div className="h-10" />;
    }
    return null;
  }

  // Retired game
  if (drawInfo?.isRetired) {
    if (variant === 'hero') {
      return (
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm font-medium">Game Ended</span>
        </div>
      );
    }
    return (
      <span className="text-xs text-gray-400">Game Ended</span>
    );
  }

  if (!drawInfo || !timeLeft) return null;

  const accentColor = colorClass || 'text-blue-600';

  if (variant === 'hero') {
    return (
      <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
        {drawInfo.isTonight ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-green-700">Drawing Tonight!</span>
            <span className={`text-sm font-mono ${accentColor}`}>{formatTimeLeft(timeLeft)}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm text-gray-600">Next Draw:</span>
            <span className={`text-sm font-semibold font-mono ${accentColor}`}>{formatTimeLeft(timeLeft)}</span>
          </>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
      {drawInfo.isTonight ? (
        <span className="text-green-700 font-medium">Tonight! {formatTimeLeft(timeLeft)}</span>
      ) : (
        <span>{formatTimeLeft(timeLeft)}</span>
      )}
    </span>
  );
}
