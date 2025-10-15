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
  return useStorage(sessionStorage, key, initialValue);
}

function useStorage<T>(
  storage: Storage,
  key: string,
  initialValue: T
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

  // Listen to storage events from other tabs
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
