import { DestroyRef, inject, signal, Signal } from '@angular/core';

/**
 * Returns a signal that is `true` while the current injection context is alive,
 * and becomes `false` when it is destroyed.
 *
 * @returns A signal indicating whether the context is mounted
 *
 * @example
 * ```ts
 * const isMounted = useIsMounted();
 *
 * effect(() => console.log('mounted?', isMounted()));
 * ```
 */
export function useIsMounted(): Signal<boolean> {
  const mounted = signal(true);
  const destroyRef = inject(DestroyRef);
  destroyRef.onDestroy(() => mounted.set(false));
  return mounted.asReadonly();
}

