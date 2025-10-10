import 'zone.js';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { tween } from './tween';

describe('tween', () => {
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

  it('should animate the signal value over time for numbers', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 1000 });

      target.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        // Check at 25% of duration
        setTimeout(() => {
          const value = current();
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(100);
        }, 250);

        // Check at 50% of duration
        setTimeout(() => {
          const value = current();
          expect(value).toBeGreaterThan(20);
          expect(value).toBeLessThan(100);
        }, 500);

        // Check at completion
        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 1100);
      });
    });
  });

  it('should animate array values over time', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween([0, 0], { duration: 1000 });

      target.set([100, 50]);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const value = current();
          expect(value[0]).toBeGreaterThan(0);
          expect(value[0]).toBeLessThan(100);
          expect(value[1]).toBeGreaterThan(0);
          expect(value[1]).toBeLessThan(50);
        }, 250);

        setTimeout(() => {
          expect(current()).toEqual([100, 50]);
          resolve();
        }, 1100);
      });
    });
  });

  it('should use custom easing function', async () => {
    TestBed.runInInjectionContext(() => {
      // Ease-in-quad: t^2
      const easeInQuad = (t: number) => t * t;
      const { current, target } = tween(0, { duration: 1000, easing: easeInQuad });

      target.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const value = current();
          // With ease-in-quad, progress should be slower at the beginning
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(50); // Should be less than linear progress
        }, 500);

        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 1100);
      });
    });
  });

  it('should return readonly current signal', () => {
    TestBed.runInInjectionContext(() => {
      const { current } = tween(0, { duration: 1000 });

      expect(current).not.toHaveProperty('set');
      expect(current).not.toHaveProperty('update');
    });
  });

  it('should handle multiple target changes', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500 });

      target.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Change target mid-animation
          target.set(50);
          TestBed.tick();

          setTimeout(() => {
            const finalValue = current();
            expect(finalValue).toBeGreaterThan(40);
            expect(finalValue).toBeLessThanOrEqual(50);
          }, 300);

          setTimeout(() => {
            expect(current()).toBe(50);
            resolve();
          }, 600);
        }, 100);
      });
    });
  });

  it('should handle negative values', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500 });

      target.set(-100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const value = current();
          expect(value).toBeLessThan(0);
          expect(value).toBeGreaterThan(-100);
        }, 250);

        setTimeout(() => {
          expect(current()).toBe(-100);
          resolve();
        }, 600);
      });
    });
  });

  it('should work with different durations', async () => {
    TestBed.runInInjectionContext(() => {
      const { current: fast, target: fastTarget } = tween(0, { duration: 200 });
      const { current: slow, target: slowTarget } = tween(0, { duration: 1000 });

      fastTarget.set(100);
      slowTarget.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Fast should be complete
          expect(fast()).toBe(100);
          // Slow should still be animating
          expect(slow()).toBeLessThan(100);
          resolve();
        }, 300);
      });
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

  it('should delay animation when delay option is provided', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500, delay: 300 });

      target.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        // During delay, value should remain at start
        setTimeout(() => {
          expect(current()).toBe(0);
        }, 150);

        // After delay, should be animating
        setTimeout(() => {
          const value = current();
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(100);
        }, 500);

        // After delay + duration, should be complete
        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 900);
      });
    });
  });

  it('should use custom interpolate function', async () => {
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

      return new Promise<void>((resolve) => {
        // At 50% time, with 2x progress, should be at 100%
        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 600);
      });
    });
  });

  it('should use custom interpolate function with arrays', async () => {
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

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const value = current();
          // First dimension should progress normally
          expect(value[0]).toBeGreaterThan(40);
          expect(value[0]).toBeLessThan(60);
          // Second dimension should be at half the progress
          expect(value[1]).toBeGreaterThan(20);
          expect(value[1]).toBeLessThan(30);
          resolve();
        }, 500);
      });
    });
  });

  it('should combine delay, easing, and custom interpolate', async () => {
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

      return new Promise<void>((resolve) => {
        // During delay
        setTimeout(() => {
          expect(current()).toBe(0);
        }, 100);

        // After delay + partial animation
        setTimeout(() => {
          const value = current();
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThan(100);
        }, 400);

        // After complete
        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 800);
      });
    });
  });

  it('should cancel delay when target changes mid-delay', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = tween(0, { duration: 500, delay: 500 });

      target.set(100);
      TestBed.tick();

      return new Promise<void>((resolve) => {
        // Change target during delay
        setTimeout(() => {
          expect(current()).toBe(0); // Still in delay
          target.set(50); // New target restarts delay
          TestBed.tick();
        }, 250);

        // Original delay would have ended, but it was cancelled
        setTimeout(() => {
          expect(current()).toBe(0); // Still in new delay
        }, 600);

        // New animation should complete
        setTimeout(() => {
          expect(current()).toBe(50);
          resolve();
        }, 1300);
      });
    });
  });
});
