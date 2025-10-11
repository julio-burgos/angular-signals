import 'zone.js';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, effect } from '@angular/core';
import { usePrevious } from './previous';

describe('usePrevious', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
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

      TestBed.tick();

      source.set(1);
      TestBed.tick();

      expect(prev()).toBe(0);
    });
  });

  it('should track multiple changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal('a');
      const prev = usePrevious(source);

      TestBed.tick();

      source.set('b');
      TestBed.tick();
      expect(prev()).toBe('a');

      source.set('c');
      TestBed.tick();
      expect(prev()).toBe('b');

      source.set('d');
      TestBed.tick();
      expect(prev()).toBe('c');
    });
  });

  it('should work with objects', () => {
    TestBed.runInInjectionContext(() => {
      const source = signal({ count: 0 });
      const prev = usePrevious(source);

      TestBed.tick();

      const oldValue = source();
      source.set({ count: 1 });
      TestBed.tick();

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

      TestBed.tick();
      expect(effectRuns).toBe(1);
      expect(lastPrev).toBeUndefined();

      source.set(20);
      TestBed.tick();
      expect(effectRuns).toBe(2);
      expect(lastPrev).toBe(10);
    });
  });
});
