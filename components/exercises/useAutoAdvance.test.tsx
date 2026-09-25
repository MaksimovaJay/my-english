import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoAdvance, AUTO_ADVANCE_MS } from './useAutoAdvance';

describe('useAutoAdvance', () => {
  afterEach(() => vi.useRealTimers());

  it('runs the callback after the delay, and not after unmount', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useAutoAdvance());
    act(() => result.current(fn));
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS - 1));
    expect(fn).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => result.current(fn));
    unmount();
    act(() => vi.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
