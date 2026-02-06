import { effect } from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';

export interface TextareaAutosizeOptions {
  /**
   * Optional max height in px. When exceeded, textarea becomes scrollable.
   */
  maxHeight?: number;
  /**
   * Update on window resize (default: true).
   */
  resize?: boolean;
}

export interface TextareaAutosizeReturn {
  update: () => void;
  stop: () => void;
}

/**
 * Automatically resizes a textarea to fit its content.
 *
 * @param target - Textarea element or getter
 * @param options - Optional configuration
 */
export function useTextareaAutosize(
  target: MaybeGetter<HTMLTextAreaElement | null | undefined>,
  options: TextareaAutosizeOptions = {}
): TextareaAutosizeReturn {
  const { maxHeight, resize = true } = options;

  const update = () => {
    const el = extract(target);
    if (!el) return;

    el.style.height = 'auto';
    const next = el.scrollHeight;

    if (typeof maxHeight === 'number') {
      const clamped = Math.min(maxHeight, next);
      el.style.height = `${clamped}px`;
      el.style.overflowY = next > maxHeight ? 'auto' : 'hidden';
    } else {
      el.style.height = `${next}px`;
      el.style.overflowY = 'hidden';
    }
  };

  const ref = effect((onCleanup) => {
    if (typeof window === 'undefined') return;
    const el = extract(target);
    if (!el) return;

    const onInput = () => update();
    el.addEventListener('input', onInput);

    let onResize: (() => void) | null = null;
    if (resize) {
      onResize = () => update();
      window.addEventListener('resize', onResize, { passive: true });
    }

    update();

    onCleanup(() => {
      el.removeEventListener('input', onInput);
      if (onResize) window.removeEventListener('resize', onResize);
    });
  });

  return { update, stop: () => ref.destroy() };
}

