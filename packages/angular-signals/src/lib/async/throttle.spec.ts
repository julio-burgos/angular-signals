import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { useThrottle } from './throttle';

describe('useThrottle', () => {
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

  it('should initialize with source value', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal('initial');
      const throttled = useThrottle(source, { delay: 100 });

      expect(throttled()).toBe('initial');
    });
  });

  it('should throttle value changes with leading edge', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const throttled = useThrottle(source, { delay: 100, leading: true });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      expect(throttled()).toBe(1); // Immediately updated (leading)

      source.set(2);
      TestBed.tick();
      expect(throttled()).toBe(1); // Throttled (ignored)

      vi.advanceTimersByTime(100);
      source.set(3);
      TestBed.tick();
      expect(throttled()).toBe(3); // Updated after delay
    });
  });

  it('should support trailing edge execution', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const throttled = useThrottle(source, { delay: 100, leading: false, trailing: true });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      expect(throttled()).toBe(0); // Not updated immediately

      vi.advanceTimersByTime(100);
      TestBed.tick();
      expect(throttled()).toBe(1); // Updated after delay
    });
  });

  it('should limit update frequency', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const throttled = useThrottle(source, { delay: 100, leading: true });


      // Rapid updates
      for (let i = 1; i <= 10; i++) {
        source.set(i);
        vi.advanceTimersByTime(20);
      }

      // Should not have updated for every change
      expect(throttled()).toBeLessThan(10);
    });
  });
});
