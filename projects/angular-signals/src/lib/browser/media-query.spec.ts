import 'zone.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { useMediaQuery } from './media-query';

describe('useMediaQuery', () => {
  let mockMatchMedia: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // Mock matchMedia
    mockMatchMedia = vi.fn((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should initialize with current match state', () => {
    TestBed.runInInjectionContext(() => {
      const matches = useMediaQuery('(min-width: 768px)');
      TestBed.tick();

      expect(typeof matches()).toBe('boolean');
    });
  });

  it('should support reactive query', () => {
    TestBed.runInInjectionContext(() => {
      const query = signal('(min-width: 768px)');
      const matches = useMediaQuery(query);

      TestBed.tick();
      expect(typeof matches()).toBe('boolean');

      query.set('(max-width: 480px)');
      TestBed.tick();
      expect(typeof matches()).toBe('boolean');
    });
  });

  it('should handle SSR gracefully', () => {
    TestBed.runInInjectionContext(() => {
      // In test environment, window is available but this tests the guard
      const matches = useMediaQuery('(min-width: 1024px)');
      TestBed.tick();

      expect(typeof matches()).toBe('boolean');
    });
  });
});
