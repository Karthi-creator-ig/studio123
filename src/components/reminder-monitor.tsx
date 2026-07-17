'use client';

import { useEffect, useRef } from 'react';
import { useReminders } from '@/lib/store-reminders';
import { useAudioEngine } from '@/components/audio-engine';
import { useToast } from '@/hooks/use-toast';
import { parseISO, differenceInSeconds } from 'date-fns';

export function ReminderMonitor() {
  const { reminders, updateReminder } = useReminders();
  const { playAlert, audioStarted } = useAudioEngine();
  const { toast } = useToast();
  const triggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    const interval = setInterval(() => {
      const now = new Date();
      
      reminders.forEach(reminder => {
        if (reminder.isActive && !triggeredRef.current.has(reminder.id)) {
          const startTime = parseISO(reminder.startTime);
          const diff = differenceInSeconds(now, startTime);

          // Trigger if time is reached (within 60s window)
          if (diff >= 0 && diff < 60) {
            triggeredRef.current.add(reminder.id);
            
            // Audio only plays if the user has "Synced Audio" previously in this session
            if (audioStarted) {
              playAlert(reminder.soundId).catch(err => {
                console.warn('Audio alert blocked by browser or context suspended');
              });
            }

            // Always show UI notification
            toast({
              title: `🔔 MEETING STARTING: ${reminder.title}`,
              description: reminder.summary || "Your global meeting is starting now.",
              duration: 15000,
            });

            // Native System Notification
            try {
              if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                const notification = new Notification(`GlobalCue: ${reminder.title}`, {
                  body: reminder.summary || "Meeting starting now.",
                  tag: reminder.id,
                  requireInteraction: true,
                });

                notification.onclick = () => {
                  window.focus();
                  notification.close();
                };
              }
            } catch (e) {
              console.error('System notification failed:', e);
            }

            // Mark as inactive
            updateReminder(reminder.id, { isActive: false });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, playAlert, audioStarted, toast, updateReminder]);

  return null;
}
