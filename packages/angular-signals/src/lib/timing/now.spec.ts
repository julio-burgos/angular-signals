import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { useNow } from './now';

describe('useNow', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('should initialize with current date', () => {
    TestBed.runInInjectionContext(() => {
      const baseTime = new Date('2025-01-01T00:00:00.000Z');
      vi.setSystemTime(baseTime);

      const now = useNow();
      expect(now()).toEqual(baseTime);
    });
  });

  it('should update at default interval (1000ms)', () => {
    TestBed.runInInjectionContext(() => {
      const baseTime = new Date('2025-01-01T00:00:00.000Z');
      vi.setSystemTime(baseTime);

      const now = useNow();

      const firstTime = now().getTime();

      vi.advanceTimersByTime(1000);
      expect(now().getTime()).toBeGreaterThan(firstTime);
    });
  });

  it('should update at custom interval', () => {
    TestBed.runInInjectionContext(() => {
      const baseTime = new Date('2025-01-01T00:00:00.000Z');
      vi.setSystemTime(baseTime);

      const now = useNow({ interval: 500 });

      const firstTime = now().getTime();

      vi.advanceTimersByTime(500);
      expect(now().getTime()).toBeGreaterThan(firstTime);
    });
  });

  it('should continuously update', () => {
    TestBed.runInInjectionContext(() => {
      const baseTime = new Date('2025-01-01T00:00:00.000Z');
      vi.setSystemTime(baseTime);

      const now = useNow({ interval: 100 });

      const times: number[] = [now().getTime()];

      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(100);
        times.push(now().getTime());
      }

      // Each time should be greater than the previous
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThanOrEqual(times[i - 1]);
      }
    });
  });
});
