import { effect } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface ObserverReturn {
  isSupported: boolean;
  stop: () => void;
}

export function useResizeObserver(
  target: MaybeGetter<Element | null | undefined>,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
): ObserverReturn {
  const isSupported = typeof ResizeObserver !== 'undefined';

  const ref = effect((onCleanup) => {
    if (!isSupported) return;

    const el = extract(target);
    if (!el) return;

    const observer = new ResizeObserver(callback);
    observer.observe(el, options);

    onCleanup(() => observer.disconnect());
  });

  return { isSupported, stop: () => ref.destroy() };
}

export function useMutationObserver(
  target: MaybeGetter<Node | null | undefined>,
  callback: MutationCallback,
  options: MutationObserverInit
): ObserverReturn {
  const isSupported = typeof MutationObserver !== 'undefined';

  const ref = effect((onCleanup) => {
    if (!isSupported) return;

    const node = extract(target);
    if (!node) return;

    const observer = new MutationObserver(callback);
    observer.observe(node, options);

    onCleanup(() => observer.disconnect());
  });

  return { isSupported, stop: () => ref.destroy() };
}

export function useIntersectionObserver(
  target: MaybeGetter<Element | null | undefined>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): ObserverReturn {
  const isSupported = typeof IntersectionObserver !== 'undefined';

  const ref = effect((onCleanup) => {
    if (!isSupported) return;

    const el = extract(target);
    if (!el) return;

    const observer = new IntersectionObserver(callback, options);
    observer.observe(el);

    onCleanup(() => observer.disconnect());
  });

  return { isSupported, stop: () => ref.destroy() };
}

