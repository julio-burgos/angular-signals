import { effect, signal, Signal, untracked } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface IdleOptions {
  /**
   * Events that reset the idle timer (default: common input/visibility events).
   */
  events?: MaybeGetter<readonly (keyof WindowEventMap)[]>;
  /**
   * Idle timeout in milliseconds (default: 60_000).
   */
  timeout?: MaybeGetter<number>;
  /**
   * Whether visibility changes should set idle/active (default: true).
   */
  detectVisibilityChanges?: MaybeGetter<boolean>;
  /**
   * Initial idle state (default: false).
   */
  initialState?: MaybeGetter<boolean>;
}

export interface IdleReturn {
  /** Whether the user is currently idle. */
  idle: Signal<boolean>;
  /** Last activity timestamp (ms since epoch). */
  lastActive: Signal<number>;
  /** Manually mark as active and reset timer. */
  reset: () => void;
  /** Stop tracking and clean up listeners/timers. */
  stop: () => void;
}

/**
 * Tracks user idle state based on activity events.
 *
 * @param options - Idle configuration
 * @returns Signals for idle state and last activity time
 *
 * @example
 * ```ts
 * const { idle } = useIdle({ timeout: 30_000 });
 *
 * effect(() => console.log('Idle?', idle()));
 * ```
 */
export function useIdle(options: IdleOptions = {}): IdleReturn {
  const defaultEvents: readonly (keyof WindowEventMap)[] = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll',
    'focus',
  ];

  const idle = signal<boolean>(extract(options.initialState ?? false));
  const lastActive = signal<number>(Date.now());

  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = (timeoutMs: number) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => idle.set(true), Math.max(0, timeoutMs));
  };

  const markActive = () => {
    idle.set(false);
    lastActive.set(Date.now());
    const timeoutMs = extract(options.timeout ?? 60_000);
    schedule(timeoutMs);
  };

  const ref = effect((onCleanup) => {
    if (typeof window === 'undefined') return;

    const eventNames = extract(options.events ?? defaultEvents);
    const detectVisibility = extract(options.detectVisibilityChanges ?? true);

    const onActivity = () => markActive();

    eventNames.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    let removeVisibilityListener: (() => void) | null = null;
    if (detectVisibility && typeof document !== 'undefined') {
      const onVisibility = () => {
        if (document.hidden) {
          untracked(() => idle.set(true));
        } else {
          onActivity();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      removeVisibilityListener = () =>
        document.removeEventListener('visibilitychange', onVisibility);
    }

    // Start the timer on first setup.
    onActivity();

    onCleanup(() => {
      eventNames.forEach((event) =>
        window.removeEventListener(event, onActivity)
      );
      removeVisibilityListener?.();
      if (timer !== null) clearTimeout(timer);
      timer = null;
    });
  });

  return {
    idle: idle.asReadonly(),
    lastActive: lastActive.asReadonly(),
    reset: () => markActive(),
    stop: () => ref.destroy(),
  };
}
