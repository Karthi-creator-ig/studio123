
"use client";

import { useState, useEffect } from 'react';
import { Reminder } from './types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('globalcue-reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }
  }, []);

  const saveReminders = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem('globalcue-reminders', JSON.stringify(newReminders));
  };

  const addReminder = (reminder: Reminder) => {
    saveReminders([...reminders, reminder]);
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  return { reminders, addReminder, deleteReminder };
}
