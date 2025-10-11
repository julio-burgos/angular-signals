import { effect, signal, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';
import { deepComputed } from './computed';

describe('deepComputed', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create a deep computed signal with deep equality check', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const baseSignal = signal({ a: 1, b: { c: 2 } });
      const computedSignal = deepComputed(() => {
        return { ...baseSignal(), d: 4 };
      });

      effect(() => {
        effectSpy(computedSignal());
      });

      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ a: 1, b: { c: 2 }, d: 4 });

      // Change base signal to a different value - SHOULD trigger effect
      baseSignal.set({ a: 1, b: { c: 3 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ a: 1, b: { c: 3 }, d: 4 });

      // Change base signal to a value that results in the same computed value - should NOT trigger effect
      baseSignal.set({ a: 1, b: { c: 3 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(2);

      // Change base signal to a different value - SHOULD trigger effect
      baseSignal.set({ a: 2, b: { c: 3 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(3);
      expect(effectSpy).toBeCalledWith({ a: 2, b: { c: 3 }, d: 4 });
    });
  });
});
