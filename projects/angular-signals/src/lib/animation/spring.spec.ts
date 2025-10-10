import 'zone.js';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi } from 'vitest';
import { spring } from './spring';

describe('spring', () => {
  it('should create spring signals with initial number value', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0);

      expect(current()).toBe(0);
      expect(target()).toBe(0);
    });
  });

  it('should create spring signals with initial array value', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring([0, 0, 0]);

      expect(current()).toEqual([0, 0, 0]);
      expect(target()).toEqual([0, 0, 0]);
    });
  });

  it('should have separate current and target signals', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(10);

      target.set(20);
      TestBed.flushEffects();

      expect(target()).toBe(20);
      expect(current()).toBe(10); // Should start at initial value
    });
  });

  it('should animate towards target value for numbers', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0, {
        stiffness: 0.5,
        damping: 0.8,
        precision: 0.01,
      });

      target.set(100);
      TestBed.flushEffects();

      // Give some time for animation frames
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const currentValue = current();
          // Should be moving towards 100 but not there yet
          expect(currentValue).toBeGreaterThan(0);
          expect(currentValue).toBeLessThan(100);
          resolve();
        }, 100);
      });
    });
  });

  it('should animate towards target value for arrays', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring([0, 0], {
        stiffness: 0.5,
        damping: 0.8,
        precision: 0.01,
      });

      target.set([100, 50]);
      TestBed.flushEffects();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const currentValue = current();
          // Each dimension should be moving towards its target
          expect(currentValue[0]).toBeGreaterThan(0);
          expect(currentValue[0]).toBeLessThan(100);
          expect(currentValue[1]).toBeGreaterThan(0);
          expect(currentValue[1]).toBeLessThan(50);
          resolve();
        }, 100);
      });
    });
  });

  it('should settle at target value eventually for numbers', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0, {
        stiffness: 0.8,
        damping: 0.9,
        precision: 0.01,
      });

      target.set(100);
      TestBed.flushEffects();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(current()).toBe(100);
          resolve();
        }, 2000);
      });
    });
  });

  it('should settle at target value eventually for arrays', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring([0, 0], {
        stiffness: 0.8,
        damping: 0.9,
        precision: 0.01,
      });

      target.set([100, 50]);
      TestBed.flushEffects();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(current()).toEqual([100, 50]);
          resolve();
        }, 2000);
      });
    });
  });

  it('should accept custom spring configuration', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0, {
        stiffness: 0.3,
        damping: 0.9,
        precision: 0.001,
      });

      expect(current()).toBe(0);
      target.set(100);
      TestBed.flushEffects();

      expect(typeof current()).toBe('number');
    });
  });

  it('should use default config when not provided', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0);

      expect(current()).toBe(0);
      target.set(50);
      TestBed.flushEffects();

      expect(typeof current()).toBe('number');
    });
  });

  it('should return readonly current signal', () => {
    TestBed.runInInjectionContext(() => {
      const { current } = spring(0);

      // TypeScript should prevent this, but we can check at runtime
      expect(current).not.toHaveProperty('set');
      expect(current).not.toHaveProperty('update');
    });
  });

  it('should handle multiple target changes', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0, {
        stiffness: 0.8,
        damping: 0.9,
      });

      target.set(100);
      TestBed.flushEffects();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Change target mid-animation
          target.set(50);
          TestBed.flushEffects();

          setTimeout(() => {
            const finalValue = current();
            expect(finalValue).toBeGreaterThan(40);
            expect(finalValue).toBeLessThanOrEqual(50);
            resolve();
          }, 500);
        }, 100);
      });
    });
  });

  it('should handle negative values', async () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0, {
        stiffness: 0.8,
        damping: 0.9,
      });

      target.set(-100);
      TestBed.flushEffects();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const currentValue = current();
          expect(currentValue).toBeLessThan(0);
          expect(currentValue).toBeGreaterThan(-100);
          resolve();
        }, 100);
      });
    });
  });

  it('should work with different array lengths', () => {
    TestBed.runInInjectionContext(() => {
      const { current: current3D, target: target3D } = spring([0, 0, 0]);
      const { current: current2D, target: target2D } = spring([0, 0]);

      expect(current3D()).toHaveLength(3);
      expect(current2D()).toHaveLength(2);

      target3D.set([10, 20, 30]);
      target2D.set([40, 50]);
      TestBed.flushEffects();

      expect(target3D()).toEqual([10, 20, 30]);
      expect(target2D()).toEqual([40, 50]);
    });
  });

  it('should handle zero target change gracefully', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(50);

      target.set(50); // Same as current
      TestBed.flushEffects();

      expect(current()).toBe(50);
    });
  });

  it('should react to target signal changes', () => {
    TestBed.runInInjectionContext(() => {
      const { current, target } = spring(0);

      // Simply verify that current is a signal that can be read
      expect(typeof current()).toBe('number');
      expect(current()).toBe(0);

      // Change target
      target.set(100);
      TestBed.flushEffects();

      // Verify target was updated
      expect(target()).toBe(100);
      // Current should still be at or near the initial value right after setting
      expect(current()).toBeLessThanOrEqual(100);
    });
  });
});
