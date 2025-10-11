import 'zone.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { useTimeout } from './timeout';

describe('useTimeout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('should execute callback after delay', () => {
    TestBed.runInInjectionContext(() => {
      let executed = false;
      const timeout = useTimeout(() => { executed = true; }, 100);

      TestBed.tick();
      expect(timeout.isPending()).toBe(true);
      expect(timeout.isReady()).toBe(false);
      expect(executed).toBe(false);

      vi.advanceTimersByTime(100);
      expect(executed).toBe(true);
      expect(timeout.isReady()).toBe(true);
      expect(timeout.isPending()).toBe(false);
    });
  });

  it('should cancel timeout', () => {
    TestBed.runInInjectionContext(() => {
      let executed = false;
      const timeout = useTimeout(() => { executed = true; }, 100);

      TestBed.tick();

      timeout.cancel();
      TestBed.tick();
      expect(timeout.isPending()).toBe(false);

      vi.advanceTimersByTime(100);
      expect(executed).toBe(false);
      expect(timeout.isReady()).toBe(false);
    });
  });

  it('should reset and restart timeout', () => {
    TestBed.runInInjectionContext(() => {
      let count = 0;
      const timeout = useTimeout(() => { count++; }, 100);

      TestBed.tick();

      vi.advanceTimersByTime(50);
      timeout.reset();
      TestBed.tick();

      expect(timeout.isPending()).toBe(true);
      expect(timeout.isReady()).toBe(false);

      vi.advanceTimersByTime(50);
      expect(count).toBe(0); // Original timeout cancelled

      vi.advanceTimersByTime(50);
      expect(count).toBe(1); // New timeout executed
      expect(timeout.isReady()).toBe(true);
    });
  });

  it('should support reactive delay', () => {
    TestBed.runInInjectionContext(() => {
      let executed = false;
      const delay = signal(100);
      const timeout = useTimeout(() => { executed = true; }, delay);

      TestBed.tick();

      delay.set(200);
      TestBed.tick();

      vi.advanceTimersByTime(100);
      expect(executed).toBe(false); // Old delay cancelled

      vi.advanceTimersByTime(100);
      expect(executed).toBe(true); // New delay completed
    });
  });

  it('should not execute after cancel', () => {
    TestBed.runInInjectionContext(() => {
      let count = 0;
      const timeout = useTimeout(() => { count++; }, 100);

      TestBed.tick();

      timeout.cancel();
      TestBed.tick();

      timeout.reset();
      TestBed.tick();
      timeout.cancel();
      TestBed.tick();

      vi.advanceTimersByTime(200);
      expect(count).toBe(0);
    });
  });
});
