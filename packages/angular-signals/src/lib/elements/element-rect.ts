import { computed, effect, signal, Signal } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';
import { useResizeObserver } from './observers';

export interface ElementRectReturn {
  rect: Signal<DOMRectReadOnly | null>;
  width: Signal<number>;
  height: Signal<number>;
  update: () => void;
}

/**
 * Tracks an element's bounding client rect.
 *
 * @param target - Element or getter
 * @returns Signals for rect and dimensions
 */
export function useElementRect(
  target: MaybeGetter<Element | null | undefined>
): ElementRectReturn {
  const rect = signal<DOMRectReadOnly | null>(null);

  const update = () => {
    const el = extract(target);
    rect.set(el ? el.getBoundingClientRect() : null);
  };

  // Update on setup and when element changes.
  effect(() => {
    extract(target);
    update();
  });

  // Update on resize/scroll.
  useResizeObserver(target, () => update());
  effect((onCleanup) => {
    if (typeof window === 'undefined') return;
    const onChange = () => update();
    window.addEventListener('resize', onChange, { passive: true });
    window.addEventListener('scroll', onChange, { passive: true });
    onCleanup(() => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange);
    });
  });

  return {
    rect: rect.asReadonly(),
    width: computed(() => rect()?.width ?? 0),
    height: computed(() => rect()?.height ?? 0),
    update,
  };
}

