import { signal, effect, WritableSignal, Signal } from '@angular/core';

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  precision?: number;
}

export interface SpringSignals<T extends number | number[]> {
  current: Signal<T>;
  target: WritableSignal<T>;
}

const DEFAULT_CONFIG: Required<SpringConfig> = {
  stiffness: 0.15,
  damping: 0.8,
  precision: 0.01,
};

/**
 * Creates a spring animation that smoothly interpolates between values.
 *
 * @param initialValue - The initial value (number or array of numbers)
 * @param config - Spring configuration with stiffness, damping, and precision
 * @returns Object with `current` (readonly signal) and `target` (writable signal)
 *
 * @example
 * ```ts
 * const { current, target } = spring(0, { stiffness: 0.15, damping: 0.8 });
 *
 * // Update target to animate
 * target.set(100);
 *
 * // Read current animated value
 * console.log(current());
 * ```
 */
export function spring(
  initialValue: number,
  config?: SpringConfig
): SpringSignals<number>;
export function spring(
  initialValue: number[],
  config?: SpringConfig
): SpringSignals<number[]>;
export function spring<T extends number | number[]>(
  initialValue: T,
  config: SpringConfig = {}
): SpringSignals<T> {
  const { stiffness, damping, precision } = { ...DEFAULT_CONFIG, ...config };

  const target = signal<T>(initialValue);
  const current = signal<T>(initialValue);
  const velocity = signal<T>(
    Array.isArray(initialValue) ? (new Array(initialValue.length).fill(0) as T) : (0 as T)
  );

  let animationFrameId: number | null = null;

  const tick = () => {
    const currentValue = current();
    const targetValue = target();
    const currentVelocity = velocity();

    if (Array.isArray(currentValue) && Array.isArray(targetValue) && Array.isArray(currentVelocity)) {
      const newValue: number[] = [];
      const newVelocity: number[] = [];
      let isSettled = true;

      for (let i = 0; i < currentValue.length; i++) {
        const delta = targetValue[i] - currentValue[i];
        const spring = delta * stiffness;
        const damper = currentVelocity[i] * damping;
        const acceleration = spring - damper;

        newVelocity[i] = currentVelocity[i] + acceleration;
        newValue[i] = currentValue[i] + newVelocity[i];

        if (Math.abs(delta) > precision || Math.abs(newVelocity[i]) > precision) {
          isSettled = false;
        }
      }

      if (!isSettled) {
        current.set(newValue as T);
        velocity.set(newVelocity as T);
        animationFrameId = requestAnimationFrame(tick);
      } else {
        current.set(targetValue);
        velocity.set(new Array(currentValue.length).fill(0) as T);
        animationFrameId = null;
      }
    } else if (typeof currentValue === 'number' && typeof targetValue === 'number' && typeof currentVelocity === 'number') {
      const delta = targetValue - currentValue;
      const spring = delta * stiffness;
      const damper = currentVelocity * damping;
      const acceleration = spring - damper;

      const newVelocity = currentVelocity + acceleration;
      const newValue = currentValue + newVelocity;

      if (Math.abs(delta) > precision || Math.abs(newVelocity) > precision) {
        current.set(newValue as T);
        velocity.set(newVelocity as T);
        animationFrameId = requestAnimationFrame(tick);
      } else {
        current.set(targetValue);
        velocity.set(0 as T);
        animationFrameId = null;
      }
    }
  };

  // Watch target changes and start animation
  effect(() => {
    const newTarget = target();

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = requestAnimationFrame(tick);
  });

  return {
    current: current.asReadonly(),
    target,
  };
}
