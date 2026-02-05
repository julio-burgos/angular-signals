import { computed, Signal } from '@angular/core';
import { MaybeGetter, extract } from '../utils/extract';
import { useActiveElement } from './active-element';

/**
 * Tracks whether focus is within a given element.
 *
 * @param target - Element or getter
 * @returns A signal that is `true` if the element contains the active element
 */
export function useFocusWithin(
  target: MaybeGetter<HTMLElement | null | undefined>
): Signal<boolean> {
  const active = useActiveElement();
  return computed(() => {
    const el = extract(target);
    const a = active();
    return Boolean(el && a && el.contains(a));
  });
}

