import { computed, effect, signal, Signal, untracked } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface ScrollDirections {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

export interface ScrollArrived {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
}

export interface ScrollStateOptions {
  /**
   * Consider within this many pixels as "arrived" (default: 1).
   */
  threshold?: number;
}

export interface ScrollStateReturn {
  x: Signal<number>;
  y: Signal<number>;
  directions: Signal<ScrollDirections>;
  arrived: Signal<ScrollArrived>;
  progressX: Signal<number>;
  progressY: Signal<number>;
  isScrolling: Signal<boolean>;
  update: () => void;
}

type ScrollTarget = Window | HTMLElement;

function getScrollTarget(target: ScrollTarget): HTMLElement | null {
  return target instanceof Window ? document.documentElement : target;
}

function getScrollLeft(target: ScrollTarget): number {
  return target instanceof Window ? window.scrollX : target.scrollLeft;
}

function getScrollTop(target: ScrollTarget): number {
  return target instanceof Window ? window.scrollY : target.scrollTop;
}

/**
 * Tracks scroll position, direction, and arrived/progress state for a target.
 *
 * @param target - Scroll target (window or element) or getter
 * @param options - Optional configuration
 */
export function useScrollState(
  target: MaybeGetter<ScrollTarget | null | undefined>,
  options: ScrollStateOptions = {}
): ScrollStateReturn {
  const threshold = options.threshold ?? 1;

  const x = signal(0);
  const y = signal(0);
  const directions = signal<ScrollDirections>({
    left: false,
    right: false,
    top: false,
    bottom: false,
  });
  const isScrolling = signal(false);

  let lastX = 0;
  let lastY = 0;
  let scrollingTimeout: ReturnType<typeof setTimeout> | null = null;

  const update = () => {
    const t = extract(target);
    if (!t) return;

    const nextX = getScrollLeft(t);
    const nextY = getScrollTop(t);

    untracked(() => {
      x.set(nextX);
      y.set(nextY);
      directions.set({
        left: nextX < lastX,
        right: nextX > lastX,
        top: nextY < lastY,
        bottom: nextY > lastY,
      });

      lastX = nextX;
      lastY = nextY;

      isScrolling.set(true);
      if (scrollingTimeout !== null) clearTimeout(scrollingTimeout);
      scrollingTimeout = setTimeout(() => {
        isScrolling.set(false);
        scrollingTimeout = null;
      }, 150);
    });
  };

  effect((onCleanup) => {
    if (typeof window === 'undefined') return;
    const t = extract(target);
    if (!t) return;

    const handler = () => update();
    const scrollTarget = t instanceof Window ? window : t;
    scrollTarget.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });

    update();

    onCleanup(() => {
      scrollTarget.removeEventListener('scroll', handler as any);
      window.removeEventListener('resize', handler as any);
      if (scrollingTimeout !== null) clearTimeout(scrollingTimeout);
      scrollingTimeout = null;
    });
  });

  const arrived = computed<ScrollArrived>(() => {
    const t = extract(target);
    if (!t) return { left: true, right: true, top: true, bottom: true };
    const el = getScrollTarget(t);
    if (!el)
      return { left: true, right: true, top: true, bottom: true };

    const left = x() <= threshold;
    const top = y() <= threshold;
    const right =
      el.scrollWidth - el.clientWidth - x() <= threshold;
    const bottom =
      el.scrollHeight - el.clientHeight - y() <= threshold;

    return { left, right, top, bottom };
  });

  const progressX = computed(() => {
    const t = extract(target);
    if (!t) return 1;
    const el = getScrollTarget(t);
    if (!el) return 1;
    const max = Math.max(1, el.scrollWidth - el.clientWidth);
    return Math.min(1, Math.max(0, x() / max));
  });

  const progressY = computed(() => {
    const t = extract(target);
    if (!t) return 1;
    const el = getScrollTarget(t);
    if (!el) return 1;
    const max = Math.max(1, el.scrollHeight - el.clientHeight);
    return Math.min(1, Math.max(0, y() / max));
  });

  return {
    x: x.asReadonly(),
    y: y.asReadonly(),
    directions: directions.asReadonly(),
    arrived,
    progressX,
    progressY,
    isScrolling: isScrolling.asReadonly(),
    update,
  };
}

