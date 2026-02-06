import {
  computed,
  effect,
  signal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { extract, MaybeGetter } from '../utils/extract';
import { withCleanupRegistrar } from '../utils/on-cleanup';

export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ResourceOptions<T> {
  /**
   * Initial value before the first successful fetch (default: undefined).
   */
  initialValue?: T;
  /**
   * If true, don't run automatically; only run on `refetch()` (default: false).
   */
  lazy?: boolean;
  /**
   * Debounce delay in milliseconds before running fetcher (default: 0).
   */
  debounce?: number;
}

export interface ResourceReturn<T, E = unknown> {
  status: Signal<ResourceStatus>;
  loading: Signal<boolean>;
  error: Signal<E | null>;
  current: Signal<T | undefined>;
  /**
   * Trigger a refetch (even if source hasn't changed).
   */
  refetch: () => void;
  /**
   * Set the current value manually (does not touch loading/error).
   */
  set: (value: T | undefined) => void;
  /**
   * Update current value (functional form).
   */
  update: (updater: (value: T | undefined) => T | undefined) => void;
}

/**
 * Creates an async resource driven by a signal (or getter) source.
 *
 * @param source - Source value (or getter) that triggers fetches when changed
 * @param fetcher - Async fetcher. Receives `{ value, abortSignal }`.
 * @param options - Optional configuration
 * @returns Resource signals and controls
 *
 * @example
 * ```ts
 * const userId = signal('1');
 *
 * const user = resource(
 *   userId,
 *   async ({ value, abortSignal }) => {
 *     const res = await fetch(`/api/users/${value}`, { signal: abortSignal });
 *     return res.json();
 *   }
 * );
 * ```
 */
export function resource<S, T, E = unknown>(
  source: MaybeGetter<S>,
  fetcher: (ctx: { value: S; abortSignal: AbortSignal }) => Promise<T>,
  options: ResourceOptions<T> = {}
): ResourceReturn<T, E> {
  const { initialValue, lazy = false, debounce = 0 } = options;

  const current = signal<T | undefined>(initialValue);
  const error = signal<E | null>(null);
  const status: WritableSignal<ResourceStatus> = signal(lazy ? 'idle' : 'loading');

  const version = signal(0);
  const refetch = () => version.update((v) => v + 1);

  let controller: AbortController | null = null;
  let debounceId: ReturnType<typeof setTimeout> | null = null;

  const run = async (value: S) => {
    controller?.abort();
    controller = new AbortController();

    untracked(() => {
      status.set('loading');
      error.set(null);
    });

    try {
      const result = await fetcher({ value, abortSignal: controller.signal });
      if (controller.signal.aborted) return;
      untracked(() => {
        current.set(result);
        status.set('success');
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      untracked(() => {
        error.set(err as E);
        status.set('error');
      });
    }
  };

  effect((registerCleanup) => {
    const value = extract(source);
    const v = version();

    if (lazy && v === 0) return;

    // Cleanup for in-flight operations
    registerCleanup(() => {
      controller?.abort();
      controller = null;
      if (debounceId !== null) {
        clearTimeout(debounceId);
        debounceId = null;
      }
    });

    withCleanupRegistrar(registerCleanup, () => {
      if (debounce > 0) {
        debounceId = setTimeout(() => {
          debounceId = null;
          void run(value);
        }, debounce);
      } else {
        void run(value);
      }
    });
  });

  return {
    status: status.asReadonly(),
    loading: computed(() => status() === 'loading'),
    error: error.asReadonly(),
    current: current.asReadonly(),
    refetch,
    set: (value) => current.set(value),
    update: (updater) => current.update(updater),
  };
}

