import { effect, signal, Signal, WritableSignal, isSignal } from '@angular/core';

/**
 * Return type for the useTimeout function.
 */
export interface TimeoutReturn {
  /** Whether the timeout has completed */
  isReady: Signal<boolean>;
  /** Whether the timeout is currently pending */
  isPending: Signal<boolean>;
  /** Cancel the timeout */
  cancel: () => void;
  /** Reset and restart the timeout */
  reset: () => void;
}

/**
 * Creates a timeout that executes a callback after a delay with cancel/reset control.
 *
 * @param callback - Function to execute after timeout
 * @param delay - Delay in milliseconds (or signal of delay)
 * @returns Object with control methods and state signals
 *
 * @example
 * ```ts
 * const timeout = useTimeout(() => {
 *   console.log('Timeout completed!');
 * }, 3000);
 *
 * effect(() => {
 *   if (timeout.isReady()) {
 *     console.log('Ready!');
 *   }
 * });
 *
 * timeout.cancel(); // Cancel the timeout
 * timeout.reset(); // Reset and restart
 * ```
 */
export function useTimeout(
  callback: () => void,
  delay: number | Signal<number>
): TimeoutReturn {
  const isReady: WritableSignal<boolean> = signal(false);
  const isPending: WritableSignal<boolean> = signal(true);
  const resetTrigger: WritableSignal<number> = signal(0);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isCancelled = false;

  effect(() => {
    resetTrigger(); // Subscribe to reset trigger
    const currentDelay = isSignal(delay) ? delay() : delay;

    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (isCancelled) {
      isPending.set(false);
      isReady.set(false);
      return;
    }

    isReady.set(false);
    isPending.set(true);

    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        callback();
        isReady.set(true);
        isPending.set(false);
      }
      timeoutId = null;
    }, currentDelay);
  });

  return {
    isReady: isReady.asReadonly(),
    isPending: isPending.asReadonly(),
    cancel: () => {
      isCancelled = true;
      isPending.set(false);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
    reset: () => {
      isCancelled = false;
      resetTrigger.update(n => n + 1); // Trigger effect re-run
    },
  };
}
