import { effect, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Return type for storage functions.
 */
export interface StorageReturn<T> {
  /** The stored value */
  value: WritableSignal<T>;
  /** Remove the value from storage */
  remove: () => void;
}

/**
 * Creates a signal synced with localStorage.
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Object with value signal and remove method
 *
 * @example
 * ```ts
 * const theme = useLocalStorage('theme', 'light');
 *
 * theme.value.set('dark'); // Persists to localStorage
 * console.log(theme.value()); // 'dark'
 * theme.remove(); // Removes from localStorage
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): StorageReturn<T> {
  return useStorage(localStorage, key, initialValue);
}

/**
 * Creates a signal synced with sessionStorage.
 * Note: sessionStorage is unique to each browser tab/window,
 * so changes are not synchronized across tabs.
 *
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Object with value signal and remove method
 *
 * @example
 * ```ts
 * const sessionData = useSessionStorage('user', { name: 'Guest' });
 *
 * sessionData.value.set({ name: 'John' }); // Persists to sessionStorage
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): StorageReturn<T> {
  return useStorage(sessionStorage, key, initialValue, false);
}

function useStorage<T>(
  storage: Storage,
  key: string,
  initialValue: T,
  enableCrossTabSync = true
): StorageReturn<T> {
  // Read initial value from storage
  const readValue = (): T => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return initialValue;
    }
  };

  const value: WritableSignal<T> = signal(readValue());

  // Write to storage on change
  effect(() => {
    if (typeof window === 'undefined') return;

    const currentValue = value();

    try {
      storage.setItem(key, JSON.stringify(currentValue));
    } catch (error) {
      console.warn(`Error writing ${key} to storage:`, error);
    }
  });

  // Listen to storage events from other tabs (only for localStorage)
  if (enableCrossTabSync) {
    effect(() => {
      if (typeof window === 'undefined') return;

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key && event.newValue) {
          try {
            value.set(JSON.parse(event.newValue));
          } catch (error) {
            console.warn(`Error parsing storage event for ${key}:`, error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    });
  }

  return {
    value,
    remove: () => {
      if (typeof window !== 'undefined') {
        storage.removeItem(key);
        value.set(initialValue);
      }
    },
  };
}

/**
 * Internal function to watch for changes to a specific storage key.
 * @internal
 */
function watchStorageKey<T>(
  storage: Storage,
  key: string,
  enableCrossTabSync = true
): Signal<T | undefined> {
  // Read initial value from storage
  const readValue = (): T | undefined => {
    if (typeof window === 'undefined') return undefined;

    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : undefined;
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return undefined;
    }
  };

  const value = signal<T | undefined>(readValue());

  // Listen to storage events from other tabs/windows (if enabled)
  if (enableCrossTabSync) {
    effect(() => {
      if (typeof window === 'undefined') return;

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key) {
          try {
            const newValue = event.newValue ? JSON.parse(event.newValue) : undefined;
            value.set(newValue);
          } catch (error) {
            console.warn(`Error parsing storage event for ${key}:`, error);
            value.set(undefined);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    });
  }

  return value;
}

/**
 * Creates a signal that watches for changes to a specific localStorage key.
 *
 * @param key - localStorage key to watch
 * @returns A signal containing the current value of the localStorage key
 *
 * @example
 * ```ts
 * const userPrefs = watchLocalStorageKey('user-preferences');
 *
 * effect(() => {
 *   const prefs = userPrefs();
 *   if (prefs) {
 *     applyPreferences(prefs);
 *   }
 * });
 * ```
 */
export function watchLocalStorageKey<T>(key: string): Signal<T | undefined> {
  return watchStorageKey(localStorage, key);
}

/**
 * Creates a signal that watches for changes to a specific sessionStorage key.
 * Note: sessionStorage is unique to each browser tab/window,
 * so this signal will not update when the key changes in other tabs.
 *
 * @param key - sessionStorage key to watch
 * @returns A signal containing the current value of the sessionStorage key
 *
 * @example
 * ```ts
 * const sessionData = watchSessionStorageKey('temp-data');
 *
 * effect(() => {
 *   console.log('Session data:', sessionData());
 * });
 * ```
 */
export function watchSessionStorageKey<T>(key: string): Signal<T | undefined> {
  return watchStorageKey(sessionStorage, key, false);
}
