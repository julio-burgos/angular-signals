import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, effect, provideZonelessChangeDetection } from '@angular/core';
import { usePrevious } from './previous';

describe('usePrevious', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should return undefined initially', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const prev = usePrevious(source);

      expect(prev()).toBeUndefined();
    });
  });

  it('should return previous value after change', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(0);
      const prev = usePrevious(source);

      TestBed.flushEffects(); // Flush the initial effect
      source.set(1);
      TestBed.flushEffects();

      expect(prev()).toBe(0);
    });
  });

  it('should track multiple changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal('a');
      const prev = usePrevious(source);

      TestBed.flushEffects(); // Flush the initial effect
      source.set('b');
      TestBed.flushEffects();
      expect(prev()).toBe('a');

      source.set('c');
      TestBed.flushEffects();
      expect(prev()).toBe('b');

      source.set('d');
      TestBed.flushEffects();
      expect(prev()).toBe('c');
    });
  });

  it('should work with objects', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal({ count: 0 });
      const prev = usePrevious(source);

      TestBed.flushEffects(); // Flush the initial effect
      const oldValue = source();
      source.set({ count: 1 });
      TestBed.flushEffects();

      expect(prev()).toEqual({ count: 0 });
      expect(prev()).toBe(oldValue);
    });
  });

  it('should work in effect', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal(10);
      const prev = usePrevious(source);
      let effectRuns = 0;
      let lastPrev: number | undefined;

      effect(() => {
        lastPrev = prev();
        effectRuns++;
      });

      TestBed.flushEffects();
      expect(effectRuns).toBe(1);
      expect(lastPrev).toBeUndefined();

      source.set(20);
      TestBed.flushEffects();
      expect(effectRuns).toBe(2);
      expect(lastPrev).toBe(10);
    });
  });
});
