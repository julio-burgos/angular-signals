import { DestroyRef, inject } from '@angular/core';

type CleanupRegistrar = (fn: () => void) => void;

let currentRegistrar: CleanupRegistrar | null = null;

export function withCleanupRegistrar<T>(
  registrar: CleanupRegistrar,
  fn: () => T
): T {
  const prev = currentRegistrar;
  currentRegistrar = registrar;
  try {
    return fn();
  } finally {
    currentRegistrar = prev;
  }
}

/**
 * Registers a cleanup callback.
 *
 * - If called within an effect callback invoked by this library (e.g. `watch`, `resource`),
 *   it is registered as an effect cleanup (runs on invalidation/destroy).
 * - Otherwise, it falls back to `DestroyRef.onDestroy` if in an injection context.
 *
 * @param fn - Cleanup callback
 *
 * @example
 * ```ts
 * watch(count, () => {
 *   const id = setInterval(() => {}, 1000);
 *   onCleanup(() => clearInterval(id));
 * });
 * ```
 */
export function onCleanup(fn: () => void): void {
  if (currentRegistrar) {
    currentRegistrar(fn);
    return;
  }

  // Fallback: register on destroy if we're in an injection context.
  const destroyRef = inject(DestroyRef, { optional: true });
  if (destroyRef) {
    destroyRef.onDestroy(fn);
    return;
  }

  throw new Error(
    'onCleanup() must be called inside a watch/resource callback or an Angular injection context.'
  );
}

