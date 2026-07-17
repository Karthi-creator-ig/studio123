
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Reminder } from './types';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc, query, orderBy, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface RemindersContextType {
  reminders: Reminder[];
  loading: boolean;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  homeTimezone: string;
  homeCountry: string;
  updateHomeSettings: (timezone: string, country: string) => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  
  const [homeTimezone, setHomeTimezone] = useState<string>('UTC');
  const [homeCountry, setHomeCountry] = useState<string>('Home');

  // Firestore Collection Reference
  const remindersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'reminders'), orderBy('startTime', 'asc'));
  }, [db, user]);

  const { data: firestoreReminders, loading } = useCollection<Reminder>(remindersQuery);

  useEffect(() => {
    const savedSettings = localStorage.getItem('globalcue-settings');
    if (savedSettings) {
      try {
        const { timezone, country } = JSON.parse(savedSettings);
        if (timezone) setHomeTimezone(timezone);
        if (country) setHomeCountry(country);
      } catch (e) {}
    } else if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setHomeTimezone(tz);
      if (tz.includes('Kolkata')) setHomeCountry('India');
      else setHomeCountry('Home');
    }
  }, []);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    if (!db || !user) return;
    const colRef = collection(db, 'users', user.uid, 'reminders');
    addDoc(colRef, { ...reminder, userId: user.uid })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: reminder
        }));
      });
  };

  const deleteReminder = (id: string) => {
    if (!db || !user) return;
    const docRef = doc(db, 'users', user.uid, 'reminders', id);
    deleteDoc(docRef)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }));
      });
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    if (!db || !user) return;
    const docRef = doc(db, 'users', user.uid, 'reminders', id);
    updateDoc(docRef, updates)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updates
        }));
      });
  };

  const updateHomeSettings = (timezone: string, country: string) => {
    setHomeTimezone(timezone);
    setHomeCountry(country || 'Home');
    localStorage.setItem('globalcue-settings', JSON.stringify({ timezone, country: country || 'Home' }));
  };

  return (
    <RemindersContext.Provider value={{ 
      reminders: (firestoreReminders || []) as Reminder[], 
      loading,
      addReminder, 
      deleteReminder, 
      updateReminder,
      homeTimezone,
      homeCountry,
      updateHomeSettings
    }}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
}
