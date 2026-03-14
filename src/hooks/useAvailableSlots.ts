'use client';

import { useState, useEffect, useCallback } from 'react';
import { TimeSlot } from '@/types';

export function useAvailableSlots(courtId: string | null, date: string | null) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!courtId || !date) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/courts/${courtId}/slots?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      setSlots(data.slots || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [courtId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, error, refetch: fetchSlots };
}
