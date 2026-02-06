import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { resource } from './resource';

describe('resource', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should start loading by default and resolve current', async () => {
    await TestBed.runInInjectionContext(async () => {
      const id = signal(1);
      const fetcher = vi.fn(async ({ value }: any) => {
        return new Promise<number>((resolve) => setTimeout(() => resolve(value * 2), 10));
      });

      const r = resource(id, fetcher);
      TestBed.tick();
      expect(r.loading()).toBe(true);

      await vi.runAllTimersAsync();
      TestBed.tick();

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(r.current()).toBe(2);
      expect(r.status()).toBe('success');
    });
  });

  it('should refetch when source changes', async () => {
    await TestBed.runInInjectionContext(async () => {
      const id = signal(1);
      const r = resource(id, async ({ value }: any) => value);
      TestBed.tick();

      await Promise.resolve();
      TestBed.tick();
      expect(r.current()).toBe(1);

      id.set(2);
      TestBed.tick();
      await Promise.resolve();
      TestBed.tick();

      expect(r.current()).toBe(2);
    });
  });

  it('should support lazy mode (only fetch on refetch)', async () => {
    await TestBed.runInInjectionContext(async () => {
      const id = signal(1);
      const fetcher = vi.fn(async ({ value }: any) => value);
      const r = resource(id, fetcher, { lazy: true });

      TestBed.tick();
      expect(fetcher).not.toHaveBeenCalled();
      expect(r.status()).toBe('idle');

      r.refetch();
      TestBed.tick();
      await Promise.resolve();
      TestBed.tick();

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(r.current()).toBe(1);
    });
  });

  it('should debounce fetches', async () => {
    await TestBed.runInInjectionContext(async () => {
      const id = signal(1);
      const fetcher = vi.fn(async ({ value }: any) => value);
      const r = resource(id, fetcher, { debounce: 50 });

      TestBed.tick();
      expect(fetcher).not.toHaveBeenCalled();

      id.set(2);
      TestBed.tick();
      vi.advanceTimersByTime(49);
      await Promise.resolve();
      TestBed.tick();
      expect(fetcher).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      await Promise.resolve();
      TestBed.tick();
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(r.current()).toBe(2);
    });
  });
});
