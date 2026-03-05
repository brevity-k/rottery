'use client';

import { useState, useEffect, useCallback } from 'react';
import { NumberSet } from '@/lib/lotteries/types';

const STORAGE_KEY = 'myLottoStats:numberSets';

function loadSets(): NumberSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSets(sets: NumberSet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
}

export function useNumberSets() {
  const [sets, setSets] = useState<NumberSet[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSets(loadSets());
    setHydrated(true);
  }, []);

  const addSet = useCallback((set: Omit<NumberSet, 'id' | 'createdAt'>) => {
    setSets(prev => {
      const newSet: NumberSet = {
        ...set,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...prev, newSet];
      saveSets(updated);
      return updated;
    });
  }, []);

  const updateSet = useCallback((id: string, updates: Partial<Omit<NumberSet, 'id' | 'createdAt'>>) => {
    setSets(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      saveSets(updated);
      return updated;
    });
  }, []);

  const deleteSet = useCallback((id: string) => {
    setSets(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSets(updated);
      return updated;
    });
  }, []);

  return { sets, hydrated, addSet, updateSet, deleteSet };
}
