import { effect, signal, Signal, untracked, WritableSignal } from '@angular/core';

export type PersistedStorageType = 'local' | 'session';

export interface PersistedStateOptions<T> {
  storage?: PersistedStorageType;
  /**
   * Sync across tabs/windows (localStorage only, default: true).
   */
  sync?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
}

export interface PersistedStateReturn<T> {
  isSupported: boolean;
  value: WritableSignal<T>;
  remove: () => void;
}

/**
 * Creates a writable signal persisted to `localStorage` or `sessionStorage`.
 *
 * @param key - Storage key
 * @param initialValue - Initial value when missing/invalid
 * @param options - Optional configuration
 * @returns Object with persisted value signal and remove method
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: PersistedStateOptions<T> = {}
): PersistedStateReturn<T> {
  const {
    storage = 'local',
    sync = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const isSupported =
    typeof window !== 'undefined' &&
    typeof (storage === 'local' ? window.localStorage : window.sessionStorage) !==
      'undefined';

  const store = isSupported
    ? storage === 'local'
      ? window.localStorage
      : window.sessionStorage
    : null;

  const read = (): T => {
    if (!store) return initialValue;
    try {
      const raw = store.getItem(key);
      return raw == null ? initialValue : deserialize(raw);
    } catch {
      return initialValue;
    }
  };

  const value = signal<T>(read());

  effect(() => {
    if (!store) return;
    const v = value();
    try {
      store.setItem(key, serialize(v));
    } catch {
      // ignore write errors
    }
  });

  if (store && storage === 'local' && sync) {
    effect((onCleanup) => {
      const handler = (event: StorageEvent) => {
        if (event.storageArea !== window.localStorage) return;
        if (event.key !== key) return;
        if (event.newValue == null) {
          untracked(() => value.set(initialValue));
          return;
        }
        try {
          untracked(() => value.set(deserialize(event.newValue!)));
        } catch {
          untracked(() => value.set(initialValue));
        }
      };

      window.addEventListener('storage', handler);
      onCleanup(() => window.removeEventListener('storage', handler));
    });
  }

  return {
    isSupported,
    value,
    remove: () => {
      if (!store) return;
      store.removeItem(key);
      value.set(initialValue);
    },
  };
}

