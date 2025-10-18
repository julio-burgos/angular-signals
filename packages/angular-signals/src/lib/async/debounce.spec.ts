import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, effect } from '@angular/core';
import { useDebounce } from './debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with source value', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal('initial');
      const debounced = useDebounce(source, { delay: 100 });

      expect(debounced()).toBe('initial');
    });
  });

  it('should debounce value changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const debounced = useDebounce(source, { delay: 100 });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      expect(debounced()).toBe(0); // Not updated yet

      vi.advanceTimersByTime(50);
      expect(debounced()).toBe(0); // Still not updated

      vi.advanceTimersByTime(50);
      TestBed.tick();
      expect(debounced()).toBe(1); // Now updated
    });
  });

  it('should cancel previous timeout on rapid changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const debounced = useDebounce(source, { delay: 100 });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      vi.advanceTimersByTime(50);

      source.set(2);
      TestBed.tick();
      vi.advanceTimersByTime(50);

      expect(debounced()).toBe(0); // Not updated

      vi.advanceTimersByTime(50);
      TestBed.tick();
      expect(debounced()).toBe(2); // Updated to last value
    });
  });

  it('should support leading edge execution', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const debounced = useDebounce(source, { delay: 100, leading: true });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      expect(debounced()).toBe(1); // Immediately updated

      vi.advanceTimersByTime(100);
      TestBed.tick();
      expect(debounced()).toBe(1); // Still same value
    });
  });

  it('should support trailing edge only', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const debounced = useDebounce(source, { delay: 100, leading: false, trailing: true });

      TestBed.tick();
      source.set(1);
      TestBed.tick();
      expect(debounced()).toBe(0); // Not updated

      vi.advanceTimersByTime(100);
      TestBed.tick();
      expect(debounced()).toBe(1); // Updated after delay
    });
  });

  it('should trigger effect on debounced change', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const debounced = useDebounce(source, { delay: 100 });
      let effectCount = 0;

      effect(() => {
        debounced();
        effectCount++;
      });

      TestBed.tick();
      expect(effectCount).toBe(1);

      source.set(1);
      TestBed.tick();
      expect(effectCount).toBe(1); // Not triggered yet

      vi.advanceTimersByTime(100);
      TestBed.tick(); // Flush effects after timer
      expect(effectCount).toBe(2); // Triggered after delay
    });
  });
});
