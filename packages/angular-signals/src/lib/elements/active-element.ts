import { effect, signal, Signal } from '@angular/core';

function deepActiveElement(root: Document | ShadowRoot): Element | null {
  let active = root.activeElement;
  while (active && (active as HTMLElement).shadowRoot?.activeElement) {
    active = (active as HTMLElement).shadowRoot!.activeElement;
  }
  return active;
}

export interface ActiveElementOptions {
  /**
   * Root document to observe (default: global document).
   */
  document?: Document;
}

/**
 * Tracks the current active element.
 *
 * @param options - Optional configuration
 * @returns A signal containing the active element (or null)
 */
export function useActiveElement(options: ActiveElementOptions = {}): Signal<Element | null> {
  const doc =
    options.document ?? (typeof document !== 'undefined' ? document : undefined);

  const active = signal<Element | null>(doc ? deepActiveElement(doc) : null);
  if (!doc) return active.asReadonly();

  effect((onCleanup) => {
    const update = () => active.set(deepActiveElement(doc));

    // focusin/focusout catch most changes; blur handles window losing focus.
    doc.addEventListener('focusin', update, true);
    doc.addEventListener('focusout', update, true);
    window.addEventListener('blur', update);
    update();

    onCleanup(() => {
      doc.removeEventListener('focusin', update, true);
      doc.removeEventListener('focusout', update, true);
      window.removeEventListener('blur', update);
    });
  });

  return active.asReadonly();
}

