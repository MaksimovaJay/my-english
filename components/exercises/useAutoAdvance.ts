'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Long enough to see «✅ Верно!», short enough not to wait. */
export const AUTO_ADVANCE_MS = 700;

/** Schedules the move to the next word after a correct answer (no «Следующее слово» button); cancelled on unmount. */
export function useAutoAdvance(): (next: () => void) => void {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback((next: () => void) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(next, AUTO_ADVANCE_MS);
  }, []);
}
