import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useSearchParams } from './search-params';

describe('useSearchParams', () => {
  it('should set and get params', () => {
    TestBed.runInInjectionContext(() => {
      window.history.replaceState({}, '', '/?a=1');
      const sp = useSearchParams({ mode: 'replace' });
      TestBed.tick();

      expect(sp.get('a')).toBe('1');

      sp.set('b', '2');
      expect(sp.get('b')).toBe('2');
      expect(window.location.search).toContain('b=2');

      sp.remove('a');
      expect(sp.get('a')).toBeNull();
    });
  });
});

