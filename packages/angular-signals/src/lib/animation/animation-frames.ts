import { effect, signal, Signal } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface AnimationFramesOptions {
  /**
   * Start immediately (default: true).
   */
  immediate?: boolean;
  /**
   * Optional FPS limit.
   */
  fpsLimit?: MaybeGetter<number | null | undefined>;
}

export interface AnimationFramesReturn {
  running: Signal<boolean>;
  time: Signal<number>;
  delta: Signal<number>;
  frame: Signal<number>;
  start: () => void;
  stop: () => void;
}

/**
 * Runs a requestAnimationFrame loop and exposes timing signals.
 *
 * @param options - Optional configuration
 * @returns Signals and controls for the animation loop
 */
export function useAnimationFrames(
  options: AnimationFramesOptions = {}
): AnimationFramesReturn {
  const running = signal(false);
  const time = signal(0);
  const delta = signal(0);
  const frame = signal(0);

  let rafId: number | null = null;
  let lastTime: number | null = null;
  let lastEmit: number | null = null;

  const stop = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    running.set(false);
    lastTime = null;
    lastEmit = null;
  };

  const tick = (t: number) => {
    if (!running()) return;

    const prev = lastTime ?? t;
    const d = t - prev;
    lastTime = t;

    const fpsLimit = extract(options.fpsLimit ?? null);
    const minInterval =
      fpsLimit && fpsLimit > 0 ? 1000 / fpsLimit : null;

    if (minInterval !== null) {
      const prevEmit = lastEmit ?? t;
      if (t - prevEmit < minInterval) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastEmit = t;
    }

    time.set(t);
    delta.set(d);
    frame.update((n) => n + 1);
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running()) return;
    running.set(true);
    rafId = requestAnimationFrame(tick);
  };

  effect((onCleanup) => {
    if (options.immediate ?? true) start();
    onCleanup(() => stop());
  });

  return {
    running: running.asReadonly(),
    time: time.asReadonly(),
    delta: delta.asReadonly(),
    frame: frame.asReadonly(),
    start,
    stop,
  };
}

