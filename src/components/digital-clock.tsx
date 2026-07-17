"use client";

import { useState, useEffect } from 'react';

export function DigitalClock({ timezone = "UTC", label }: { timezone?: string; label?: string }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time only on client to avoid hydration mismatch
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return (
    <div className="flex flex-col items-center justify-center p-4 glass-panel rounded-xl min-w-[140px] h-[76px] animate-pulse">
      <div className="h-8 w-24 bg-white/5 rounded"></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4 glass-panel rounded-xl min-w-[140px]">
      <div className="text-3xl font-code font-bold tracking-widest text-accent">
        {time.toLocaleTimeString('en-US', { 
          timeZone: timezone, 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 font-bold tracking-widest uppercase">
        {label || timezone}
      </div>
    </div>
  );
}
