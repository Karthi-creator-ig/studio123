'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, reload } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
        setUser({ ...auth.currentUser } as User);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return { user, loading, refreshUser };
}
