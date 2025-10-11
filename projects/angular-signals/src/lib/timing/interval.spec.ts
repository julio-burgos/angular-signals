import 'zone.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { useInterval } from './interval';

describe('useInterval', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('should execute callback at interval', () => {
    TestBed.runInInjectionContext(() => {
      let callbackCount = 0;
      const interval = useInterval(() => callbackCount++, 100);

      TestBed.tick();
      expect(callbackCount).toBe(0);

      vi.advanceTimersByTime(100);
      expect(callbackCount).toBe(1);

      vi.advanceTimersByTime(100);
      expect(callbackCount).toBe(2);

      vi.advanceTimersByTime(300);
      expect(callbackCount).toBe(5);
    });
  });

  it('should track execution count', () => {
    TestBed.runInInjectionContext(() => {
      const interval = useInterval(() => {}, 100);

      TestBed.tick();
      expect(interval.count()).toBe(0);

      vi.advanceTimersByTime(100);
      expect(interval.count()).toBe(1);

      vi.advanceTimersByTime(200);
      expect(interval.count()).toBe(3);
    });
  });

  it('should pause and resume', () => {
    TestBed.runInInjectionContext(() => {
      let callbackCount = 0;
      const interval = useInterval(() => callbackCount++, 100);

      TestBed.tick();

      vi.advanceTimersByTime(200);
      expect(callbackCount).toBe(2);
      expect(interval.isActive()).toBe(true);

      interval.pause();
      TestBed.tick();
      expect(interval.isActive()).toBe(false);

      vi.advanceTimersByTime(200);
      expect(callbackCount).toBe(2); // No change while paused

      interval.resume();
      TestBed.tick();
      expect(interval.isActive()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(callbackCount).toBe(3); // Resumed
    });
  });

  it('should reset count and restart', () => {
    TestBed.runInInjectionContext(() => {
      let callbackCount = 0;
      const interval = useInterval(() => callbackCount++, 100);

      TestBed.tick();

      vi.advanceTimersByTime(300);
      expect(interval.count()).toBe(3);

      interval.pause();
      TestBed.tick();

      interval.reset();
      TestBed.tick();
      expect(interval.count()).toBe(0);
      expect(interval.isActive()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(interval.count()).toBe(1);
    });
  });

  it('should support reactive delay', () => {
    TestBed.runInInjectionContext(() => {
      let callbackCount = 0;
      const delay = signal(100);
      const interval = useInterval(() => callbackCount++, delay);

      TestBed.tick();

      vi.advanceTimersByTime(100);
      expect(callbackCount).toBe(1);

      delay.set(200);
      TestBed.tick();

      vi.advanceTimersByTime(200);
      expect(callbackCount).toBe(2);
    });
  });
});
