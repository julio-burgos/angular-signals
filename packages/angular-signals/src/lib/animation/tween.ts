import { effect, Signal, signal, WritableSignal } from '@angular/core';

export type InterpolateFunction<T> = (from: T, to: T,) => (t: number) => T;

export interface TweenOptions<T extends number | number[]> {
  duration: number;
  delay?: number;
  easing?: (t: number) => number;
  interpolate?: InterpolateFunction<T>;
}

export interface TweenSignals<T extends number | number[]> {
  current: Signal<T>;
  target: WritableSignal<T>;
}

/**
 * Default interpolation function for numbers
 */
function defaultNumberInterpolate(from: number, to: number): (t: number) => number {
  return (t: number) => from + (to - from) * t;
}

/**
 * Default interpolation function for arrays
 */
function defaultArrayInterpolate(from: number[], to: number[]): (t: number) => number[] {
  return (t: number) => {
    const result: number[] = [];
    for (let i = 0; i < from.length; i++) {
      result[i] = from[i] + (to[i] - from[i]) * t;
    }
    return result;
  };
}

/**
 * Creates a tween animation that smoothly interpolates between values over a fixed duration.
 *
 * @param initialValue - The initial value (number or array of numbers)
 * @param options - Tween configuration with duration, delay, easing function, and interpolation
 * @returns Object with `current` (readonly signal) and `target` (writable signal)
 *
 * @example
 * ```ts
 * // Basic usage
 * const { current, target } = tween(0, {
 *   duration: 1000,
 *   delay: 500,
 *   easing: (t) => t * t
 * });
 *
 * // With custom interpolation (curried function)
 * const { current, target } = tween(0, {
 *   duration: 1000,
 *   interpolate: (from, to) => (t) => from + (to - from) * t
 * });
 *
 * // Update target to animate
 * target.set(100);
 *
 * // Read current animated value
 * console.log(current());
 * ```
 */
export function tween(
  initialValue: number,
  options: TweenOptions<number>
): TweenSignals<number>;
export function tween(
  initialValue: number[],
  options: TweenOptions<number[]>
): TweenSignals<number[]>;
export function tween<T extends number | number[]>(
  initialValue: T,
  options: TweenOptions<T>
): TweenSignals<T> {
  const {
    duration,
    delay = 0,
    easing = (t) => t,
    interpolate
  } = options;

  const target = signal<T>(initialValue);
  const current = signal<T>(initialValue);

  let startValue: T = initialValue;
  let delayStartTime: number | null = null;
  let animationStartTime: number | null = null;
  let animationFrameId: number | null = null;
  let timeoutId: number | null = null;

  const animate = (time: number) => {
    // Handle delay
    if (delay > 0 && delayStartTime === null) {
      delayStartTime = time;
    }

    if (delay > 0 && delayStartTime !== null) {
      const delayElapsed = time - delayStartTime;
      if (delayElapsed < delay) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
    }

    // Start animation after delay
    if (animationStartTime === null) {
      animationStartTime = time;
    }

    const elapsed = time - animationStartTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easing(t);

    const targetValue = target();

    // Use custom interpolate function if provided
    if (interpolate) {
      const interpolateFn = interpolate(startValue, targetValue);
      const newValue = interpolateFn(easedT);
      current.set(newValue);
    } else if (Array.isArray(startValue) && Array.isArray(targetValue)) {
      const interpolateFn = defaultArrayInterpolate(startValue, targetValue);
      const newValue = interpolateFn(easedT);
      current.set(newValue as T);
    } else if (typeof startValue === 'number' && typeof targetValue === 'number') {
      const interpolateFn = defaultNumberInterpolate(startValue, targetValue);
      const newValue = interpolateFn(easedT);
      current.set(newValue as T);
    }

    if (t < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      current.set(targetValue);
      animationFrameId = null;
      delayStartTime = null;
      animationStartTime = null;
    }
  };

  // Watch target changes and start animation
  effect(() => {
    const newTarget = target();

    // Cancel any pending animations
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    startValue = current() as T;
    delayStartTime = null;
    animationStartTime = null;

    if (delay > 0) {
      // Use setTimeout for delay if specified
      timeoutId = window.setTimeout(() => {
        animationFrameId = requestAnimationFrame(animate);
        timeoutId = null;
      }, delay);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  return {
    current: current.asReadonly(),
    target,
  };
}

