import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useLocalStorage, useSessionStorage } from './storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with initial value if key does not exist', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useLocalStorage('test-key', 'default');
      expect(storage.value()).toBe('default');
    });
  });

  it('should initialize with stored value if key exists', () => {
    TestBed.runInInjectionContext(() => {
      localStorage.setItem('existing-key', JSON.stringify('stored'));
      const storage = useLocalStorage('existing-key', 'default');
      expect(storage.value()).toBe('stored');
    });
  });

  it('should persist value to localStorage', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useLocalStorage('persist-key', 'initial');

      storage.value.set('updated');
      TestBed.tick();

      const stored = localStorage.getItem('persist-key');
      expect(stored).toBe(JSON.stringify('updated'));
    });
  });

  it('should work with objects', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useLocalStorage('object-key', { count: 0 });

      storage.value.set({ count: 42 });
      TestBed.tick();

      const stored = localStorage.getItem('object-key');
      expect(JSON.parse(stored!)).toEqual({ count: 42 });
    });
  });

  it('should work with arrays', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useLocalStorage<number[]>('array-key', []);

      storage.value.set([1, 2, 3]);
      TestBed.tick();

      const stored = localStorage.getItem('array-key');
      expect(JSON.parse(stored!)).toEqual([1, 2, 3]);
    });
  });

  it('should remove value from storage', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useLocalStorage('remove-key', 'value');

      storage.value.set('updated');
      TestBed.tick();
      expect(localStorage.getItem('remove-key')).toBeTruthy();

      storage.remove();
      expect(localStorage.getItem('remove-key')).toBeNull();
      expect(storage.value()).toBe('value'); // Reset to initial
    });
  });
});

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should initialize with initial value', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useSessionStorage('session-key', 123);
      expect(storage.value()).toBe(123);
    });
  });

  it('should persist to sessionStorage', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useSessionStorage('session-key', 0);

      storage.value.set(456);
      TestBed.tick();

      const stored = sessionStorage.getItem('session-key');
      expect(stored).toBe(JSON.stringify(456));
    });
  });

  it('should remove value from sessionStorage', () => {
    TestBed.runInInjectionContext(() => {
      const storage = useSessionStorage('remove-session-key', 'initial');

      storage.value.set('updated');

      storage.remove();
      expect(sessionStorage.getItem('remove-session-key')).toBeNull();
    });
  });
});
