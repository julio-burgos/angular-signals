import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { usePersistedState } from './persisted-state';

describe('usePersistedState', () => {
  const key = 'persisted-test';

  beforeEach(() => {
    localStorage.removeItem(key);
  });

  afterEach(() => {
    localStorage.removeItem(key);
  });

  it('should read and write localStorage', () => {
    TestBed.runInInjectionContext(() => {
      const s = usePersistedState(key, 0);
      expect(s.value()).toBe(0);

      s.value.set(5);
      TestBed.tick();
      expect(JSON.parse(localStorage.getItem(key) || '0')).toBe(5);
    });
  });

  it('should sync across tabs via storage event', () => {
    TestBed.runInInjectionContext(() => {
      const s = usePersistedState(key, 0);
      TestBed.tick();

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(7),
          storageArea: localStorage,
        })
      );
      TestBed.tick();
      expect(s.value()).toBe(7);
    });
  });
});

