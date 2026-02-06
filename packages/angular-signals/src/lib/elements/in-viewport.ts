import { computed, signal, Signal } from '@angular/core';
import { MaybeGetter } from '../utils/extract';
import { useIntersectionObserver } from './observers';

export interface InViewportReturn {
  inViewport: Signal<boolean>;
  entry: Signal<IntersectionObserverEntry | null>;
  stop: () => void;
}

/**
 * Tracks whether an element is in the viewport using IntersectionObserver.
 *
 * @param target - Element or getter
 * @param options - Intersection observer options
 * @returns Signals for in-viewport state and last entry
 */
export function useInViewport(
  target: MaybeGetter<Element | null | undefined>,
  options?: IntersectionObserverInit
): InViewportReturn {
  const entry = signal<IntersectionObserverEntry | null>(null);
  const isSupported = typeof IntersectionObserver !== 'undefined';

  const observer = useIntersectionObserver(
    target,
    (entries) => {
      entry.set(entries[0] ?? null);
    },
    options
  );

  return {
    inViewport: computed(() => {
      if (!isSupported) return true;
      return entry()?.isIntersecting ?? false;
    }),
    entry: entry.asReadonly(),
    stop: observer.stop,
  };
}
