import { effect } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface ClickOutsideOptions {
  /**
   * Events to listen on (default: ['pointerdown']).
   */
  events?: readonly (keyof DocumentEventMap)[];
  /**
   * Listen during the capture phase (default: true).
   */
  capture?: boolean;
  /**
   * Elements that should be treated as "inside" (ignored for outside detection).
   */
  ignore?: readonly MaybeGetter<HTMLElement | null | undefined>[];
}

export interface ClickOutsideReturn {
  stop: () => void;
}

/**
 * Calls a handler when a pointer event happens outside the target element.
 *
 * @param target - Target element or getter
 * @param handler - Callback invoked for outside events
 * @param options - Optional configuration
 * @returns Control object with `stop()`
 *
 * @example
 * ```ts
 * const el = signal<HTMLElement | null>(null);
 * onClickOutside(el, () => console.log('outside'));
 * ```
 */
export function onClickOutside(
  target: MaybeGetter<HTMLElement | null | undefined>,
  handler: (event: Event) => void,
  options: ClickOutsideOptions = {}
): ClickOutsideReturn {
  const { events = ['pointerdown'], capture = true, ignore = [] } = options;

  const ref = effect((onCleanup) => {
    if (typeof document === 'undefined') return;

    const el = extract(target);
    if (!el) return;

    const ignoreElements = ignore
      .map((i) => extract(i))
      .filter((x): x is HTMLElement => Boolean(x));

    const listener = (event: Event) => {
      const path = (event.composedPath?.() ?? []) as unknown[];
      const isInside =
        path.includes(el) || (el.contains(event.target as Node) ?? false);

      if (isInside) return;

      for (const ignored of ignoreElements) {
        if (path.includes(ignored) || ignored.contains(event.target as Node)) {
          return;
        }
      }

      handler(event);
    };

    events.forEach((eventName) =>
      document.addEventListener(eventName, listener, { capture })
    );

    onCleanup(() => {
      events.forEach((eventName) =>
        document.removeEventListener(eventName, listener, { capture } as any)
      );
    });
  });

  return { stop: () => ref.destroy() };
}

