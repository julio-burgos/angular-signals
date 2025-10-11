import { effect, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { deepSignal } from "./signal";
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';

describe('deepSignal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create a deep signal with deep equality check', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const signal = deepSignal({ a: 1, b: { c: 2 } });

      effect(() => {
        effectSpy(signal());
      });

      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ a: 1, b: { c: 2 } });

      // Set the same value - should NOT trigger effect due to deep equality
      signal.set({ a: 1, b: { c: 2 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(1);

      // Set a different value - SHOULD trigger effect
      signal.set({ a: 1, b: { c: 3 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ a: 1, b: { c: 3 } });
    });
  });

  it('should work with nested objects and arrays', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const signal = deepSignal({ arr: [1, 2, { x: 3 }], obj: { y: 4 } });

      effect(() => {
        effectSpy(signal());
      });

      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ arr: [1, 2, { x: 3 }], obj: { y: 4 } });

      // Set the same value - should NOT trigger effect due to deep equality
      signal.set({ arr: [1, 2, { x: 3 }], obj: { y: 4 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(1);

      // Modify nested object - SHOULD trigger effect
      signal.set({ arr: [1, 2, { x: 5 }], obj: { y: 4 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ arr: [1, 2, { x: 5 }], obj: { y: 4 } });

      // Modify nested array - SHOULD trigger effect
      signal.set({ arr: [1, 2, { x: 5 }, 6], obj: { y: 4 } });
      TestBed.flushEffects();
      expect(effectSpy).toBeCalledTimes(3);
      expect(effectSpy).toBeCalledWith({ arr: [1, 2, { x: 5 }, 6], obj: { y: 4 } });
    });
  });
});


