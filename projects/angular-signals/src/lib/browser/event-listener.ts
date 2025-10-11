import { effect, Signal, isSignal } from '@angular/core';

/**
 * Attaches an event listener to a target with automatic cleanup.
 *
 * @param target - Event target (Window, Document, HTMLElement, or signal of element)
 * @param event - Event name
 * @param handler - Event handler function
 * @param options - AddEventListener options
 *
 * @example
 * ```ts
 * // Listen to window resize
 * useEventListener(window, 'resize', () => {
 *   console.log('Window resized');
 * });
 *
 * // Listen to element clicks
 * const button = signal<HTMLElement | null>(null);
 * useEventListener(button, 'click', (event) => {
 *   console.log('Button clicked', event);
 * });
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  event: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Signal<HTMLElement | null>,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): void;

export function useEventListener(
  target: any,
  event: string,
  handler: (event: any) => void,
  options?: AddEventListenerOptions
): void {
  effect(() => {
    if (typeof window === 'undefined') return;

    const currentTarget = isSignal(target) ? target() : target;
    if (!currentTarget) return;

    currentTarget.addEventListener(event, handler, options);

    return () => {
      currentTarget.removeEventListener(event, handler, options);
    };
  });
}
