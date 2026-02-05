import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tween } from './tween';

describe('tween', () => {
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      window.setTimeout(() => cb(Date.now()), 16)) as any;
    globalThis.cancelAnimationFrame = ((id: number) =>
      window.clearTimeout(id)) as any;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();

    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('should create tween signals with initial number value', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 1000 });

      expect(current()).toBe(0);
      expect(target()).toBe(0);
    });
  });

  it('should create tween signals with initial array value', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween([0, 0], { duration: 1000 });

      expect(current()).toEqual([0, 0]);
      expect(target()).toEqual([0, 0]);
    });
  });

  it('should animate the signal value over time for numbers', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 1000 });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(250);
      const value25 = current();
      expect(value25).toBeGreaterThan(0);
      expect(value25).toBeLessThan(100);

      vi.advanceTimersByTime(250);
      const value50 = current();
      expect(value50).toBeGreaterThan(20);
      expect(value50).toBeLessThan(100);

      vi.advanceTimersByTime(600);
      expect(current()).toBe(100);
    });
  });

  it('should animate array values over time', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween([0, 0], { duration: 1000 });

      target.set([100, 50]);
      TestBed.tick();

      vi.advanceTimersByTime(250);
      const value = current();
      expect(value[0]).toBeGreaterThan(0);
      expect(value[0]).toBeLessThan(100);
      expect(value[1]).toBeGreaterThan(0);
      expect(value[1]).toBeLessThan(50);

      vi.advanceTimersByTime(850);
      expect(current()).toEqual([100, 50]);
    });
  });

  it('should use custom easing function', () => {
    TestBed.runInInjectionContext(() => {
      // Ease-in-quad: t^2
      const easeInQuad = (t: number) => t * t;
      const { current, target } = tween(0, { duration: 1000, easing: easeInQuad });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(500);
      const value = current();
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThan(50);

      vi.advanceTimersByTime(600);
      expect(current()).toBe(100);
    });
  });

  it('should return readonly current signal', () => {
    TestBed.runInInjectionContext(() => {
      const { current } = tween(0, { duration: 1000 });

      expect(current).not.toHaveProperty('set');
      expect(current).not.toHaveProperty('update');
    });
  });

  it('should handle multiple target changes', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500 });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(100);
      target.set(50);
      TestBed.tick();

      vi.advanceTimersByTime(300);
      const finalValue = current();
      expect(finalValue).toBeLessThanOrEqual(50);
      expect(Math.abs(50 - finalValue)).toBeLessThan(50);

      vi.advanceTimersByTime(400);
      expect(current()).toBe(50);
    });
  });

  it('should handle negative values', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500 });

      target.set(-100);
      TestBed.tick();

      vi.advanceTimersByTime(250);
      const value = current();
      expect(value).toBeLessThan(0);
      expect(value).toBeGreaterThan(-100);

      vi.advanceTimersByTime(350);
      expect(current()).toBe(-100);
    });
  });

  it('should work with different durations', () => {
    TestBed.runInInjectionContext(() => {
      const { current: fast, target: fastTarget } = tween(0, { duration: 200 });
      const { current: slow, target: slowTarget } = tween(0, { duration: 1000 });

      fastTarget.set(100);
      slowTarget.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(300);
      expect(fast()).toBe(100);
      expect(slow()).toBeLessThan(100);
    });
  });

  it('should handle zero target change gracefully', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(50, { duration: 1000 });

      target.set(50); // Same as current
      TestBed.tick();

      expect(current()).toBe(50);
    });
  });

  it('should delay animation when delay option is provided', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500, delay: 300 });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(150);
      expect(current()).toBe(0);

      vi.runAllTimers();
      expect(current()).toBe(100);
    });
  });

  it('should use custom interpolate function', () => {
    TestBed.runInInjectionContext(() => {
      // Custom interpolate that doubles the progress (curried function)
      const customInterpolate = (from: number, to: number) => (progress: number): number => {
        return from + (to - from) * Math.min(progress * 2, 1);
      };

      const { current, target } = tween(0, {
        duration: 1000,
        interpolate: customInterpolate
      });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(600);
      expect(current()).toBe(100);
    });
  });

  it('should use custom interpolate function with arrays', () => {
    TestBed.runInInjectionContext(() => {
      // Custom interpolate that applies different rates to each dimension (curried function)
      const customInterpolate = (from: number[], to: number[]) => (progress: number): number[] => {
        return [
          from[0] + (to[0] - from[0]) * progress,
          from[1] + (to[1] - from[1]) * progress * 0.5, // Half speed for second dimension
        ];
      };

      const { current, target } = tween([0, 0], {
        duration: 1000,
        interpolate: customInterpolate
      });

      target.set([100, 100]);
      TestBed.tick();

      vi.advanceTimersByTime(500);
      const value = current();
      expect(value[0]).toBeGreaterThan(40);
      expect(value[0]).toBeLessThan(60);
      expect(value[1]).toBeGreaterThan(20);
      expect(value[1]).toBeLessThan(30);
    });
  });

  it('should combine delay, easing, and custom interpolate', () => {
    TestBed.runInInjectionContext(() => {
      const easeInQuad = (t: number) => t * t;
      // Curried interpolate function
      const customInterpolate = (from: number, to: number) => (progress: number): number => {
        return from + (to - from) * progress;
      };

      const { current, target } = tween(0, {
        duration: 500,
        delay: 200,
        easing: easeInQuad,
        interpolate: customInterpolate
      });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(100);
      expect(current()).toBe(0);

      vi.runAllTimers();
      expect(current()).toBe(100);
    });
  });

  it('should cancel delay when target changes mid-delay', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500, delay: 500 });

      target.set(100);
      TestBed.tick();

      vi.advanceTimersByTime(250);
      expect(current()).toBe(0);
      target.set(50);
      TestBed.tick();

      vi.advanceTimersByTime(350);
      expect(current()).toBe(0);

      vi.runAllTimers();
      expect(current()).toBe(50);
    });
  });
});
