import { computed, Signal } from '@angular/core';
import { MaybeGetter } from '../utils/extract';
import { useElementRect } from './element-rect';

export interface ElementSizeReturn {
  width: Signal<number>;
  height: Signal<number>;
}

/**
 * Tracks an element's size (width/height).
 *
 * @param target - Element or getter
 * @returns Signals for width and height
 */
export function useElementSize(
  target: MaybeGetter<Element | null | undefined>
): ElementSizeReturn {
  const rect = useElementRect(target);
  return {
    width: computed(() => rect.width()),
    height: computed(() => rect.height()),
  };
}

