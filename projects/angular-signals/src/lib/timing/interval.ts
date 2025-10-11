import { effect, signal, Signal, WritableSignal, isSignal } from '@angular/core';

/**
 * Return type for the useInterval function.
 */
export interface IntervalReturn {
  /** Number of times the interval has executed */
  count: Signal<number>;
  /** Whether the interval is currently active */
  isActive: Signal<boolean>;
  /** Pause the interval */
  pause: () => void;
  /** Resume the interval */
  resume: () => void;
  /** Reset the count and restart the interval */
  reset: () => void;
}

/**
 * Creates an interval that executes a callback repeatedly with pause/resume control.
 *
 * @param callback - Function to execute on each interval
 * @param delay - Delay in milliseconds (or signal of delay)
 * @returns Object with control methods and state signals
 *
 * @example
 * ```ts
 * const timer = useInterval(() => {
 *   console.log('Tick');
 * }, 1000);
 *
 * console.log(timer.count()); // Number of ticks
 * timer.pause(); // Pause the interval
 * timer.resume(); // Resume the interval
 * timer.reset(); // Reset count and restart
 * ```
 */
export function useInterval(
  callback: () => void,
  delay: number | Signal<number>
): IntervalReturn {
  const count: WritableSignal<number> = signal(0);
  const isActive: WritableSignal<boolean> = signal(true);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  effect(() => {
    const active = isActive();
    const currentDelay = isSignal(delay) ? delay() : delay;

    // Clear any existing interval
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    // Create new interval if active
    if (active) {
      intervalId = setInterval(() => {
        callback();
        count.update(c => c + 1);
      }, currentDelay);
    }
  });

  return {
    count: count.asReadonly(),
    isActive: isActive.asReadonly(),
    pause: () => isActive.set(false),
    resume: () => isActive.set(true),
    reset: () => {
      count.set(0);
      isActive.set(true);
    },
  };
}
