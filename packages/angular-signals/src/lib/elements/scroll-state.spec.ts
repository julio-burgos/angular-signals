import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useScrollState } from './scroll-state';

describe('useScrollState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should track element scroll position', () => {
    TestBed.runInInjectionContext(() => {
      const el = document.createElement('div');
      Object.assign(el.style, { width: '100px', height: '50px', overflow: 'auto' });
      el.innerHTML = `<div style="width:1000px;height:1000px"></div>`;
      document.body.appendChild(el);

      const s = useScrollState(() => el);
      TestBed.tick();

      el.scrollTop = 10;
      el.scrollLeft = 5;
      el.dispatchEvent(new Event('scroll'));
      TestBed.tick();

      expect(s.y()).toBe(10);
      expect(s.x()).toBe(5);
      expect(s.isScrolling()).toBe(true);

      vi.advanceTimersByTime(200);
      expect(s.isScrolling()).toBe(false);
    });
  });
});

