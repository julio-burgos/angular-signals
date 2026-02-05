import { effect, signal, Signal } from '@angular/core';

export interface DocumentVisibleOptions {
  /**
   * Document to observe (default: global document).
   * Useful for testing or iframes.
   */
  document?: Document;
}

/**
 * Creates a signal that tracks whether the document is currently visible.
 *
 * @param options - Optional configuration
 * @returns A signal that is `true` when the document is visible
 *
 * @example
 * ```ts
 * const isVisible = useDocumentVisible();
 *
 * effect(() => {
 *   console.log('Visible?', isVisible());
 * });
 * ```
 */
export function useDocumentVisible(
  options: DocumentVisibleOptions = {}
): Signal<boolean> {
  const doc =
    options.document ?? (typeof document !== 'undefined' ? document : undefined);

  const visible = signal<boolean>(doc ? !doc.hidden : true);

  if (!doc) return visible.asReadonly();

  effect((onCleanup) => {
    const update = () => visible.set(!doc.hidden);

    doc.addEventListener('visibilitychange', update);
    update();

    onCleanup(() => doc.removeEventListener('visibilitychange', update));
  });

  return visible.asReadonly();
}

