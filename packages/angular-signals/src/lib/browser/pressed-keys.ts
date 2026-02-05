import { computed, effect, signal, Signal } from '@angular/core';

export interface PressedKeysOptions {
  /**
   * Target to listen on (default: window).
   */
  target?: Window;
}

export interface PressedKeysReturn {
  /** Sorted list of currently pressed keys (KeyboardEvent.key). */
  keys: Signal<readonly string[]>;
  /** Whether all provided keys are currently pressed. Reactive inside effects/computeds. */
  has: (...keys: string[]) => boolean;
  /** Run a callback when all provided keys become pressed. Returns a stop function. */
  onKeys: (keys: readonly string[], callback: () => void) => () => void;
  /** Clear the pressed keys set. */
  clear: () => void;
}

/**
 * Tracks currently pressed keys.
 *
 * @param options - Optional configuration
 * @returns Object with pressed keys signal and helpers
 *
 * @example
 * ```ts
 * const pressed = usePressedKeys();
 *
 * effect(() => {
 *   if (pressed.has('Control', 'k')) openCommandPalette();
 * });
 * ```
 */
export function usePressedKeys(options: PressedKeysOptions = {}): PressedKeysReturn {
  const target = options.target ?? (typeof window !== 'undefined' ? window : undefined);
  const pressedSet = signal<ReadonlySet<string>>(new Set<string>());

  const keys = computed(() => Array.from(pressedSet()).sort());

  const has = (...wanted: string[]) => {
    const current = pressedSet();
    return wanted.every((k) => current.has(k));
  };

  const clear = () => pressedSet.set(new Set());

  effect((onCleanup) => {
    if (!target) return;

    const down = (event: KeyboardEvent) => {
      pressedSet.update((prev) => {
        const next = new Set(prev);
        next.add(event.key);
        return next;
      });
    };

    const up = (event: KeyboardEvent) => {
      pressedSet.update((prev) => {
        const next = new Set(prev);
        next.delete(event.key);
        return next;
      });
    };

    const blur = () => clear();

    target.addEventListener('keydown', down);
    target.addEventListener('keyup', up);
    target.addEventListener('blur', blur);

    onCleanup(() => {
      target.removeEventListener('keydown', down);
      target.removeEventListener('keyup', up);
      target.removeEventListener('blur', blur);
    });
  });

  const onKeys = (wanted: readonly string[], callback: () => void) => {
    let wasPressed = false;
    const ref = effect(() => {
      const isPressed = has(...wanted);
      if (isPressed && !wasPressed) callback();
      wasPressed = isPressed;
    });

    return () => ref.destroy();
  };

  return { keys, has, onKeys, clear };
}
