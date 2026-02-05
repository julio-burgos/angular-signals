import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useResizeObserver, useIntersectionObserver } from './observers';
import { useElementRect } from './element-rect';
import { useFocusWithin } from './focus-within';
import { useInViewport } from './in-viewport';

describe('element utilities', () => {
  describe('useResizeObserver', () => {
    const original = (globalThis as any).ResizeObserver;

    afterEach(() => {
      (globalThis as any).ResizeObserver = original;
    });

    it('should observe and disconnect', () => {
      TestBed.runInInjectionContext(() => {
        const observe = vi.fn();
        const disconnect = vi.fn();
        (globalThis as any).ResizeObserver = vi.fn(function (this: any) {
          this.observe = observe;
          this.disconnect = disconnect;
        });

        const el = document.createElement('div');
        const api = useResizeObserver(() => el, () => {});
        TestBed.tick();

        expect(api.isSupported).toBe(true);
        expect(observe).toHaveBeenCalledTimes(1);

        api.stop();
        expect(disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('useIntersectionObserver + useInViewport', () => {
    const original = (globalThis as any).IntersectionObserver;

    afterEach(() => {
      (globalThis as any).IntersectionObserver = original;
    });

    it('should update entry and inViewport', () => {
      TestBed.runInInjectionContext(() => {
        let last: any = null;
        (globalThis as any).IntersectionObserver = vi.fn(function (this: any, cb: any) {
          this.observe = vi.fn();
          this.disconnect = vi.fn();
          this._cb = cb;
          last = this;
        });

        const el = document.createElement('div');
        const api = useInViewport(() => el);
        TestBed.tick();

        expect(api.inViewport()).toBe(false);

        last._cb([{ isIntersecting: true }], last);
        TestBed.tick();
        expect(api.inViewport()).toBe(true);
      });
    });
  });

  describe('useElementRect', () => {
    it('should update rect on demand', () => {
      TestBed.runInInjectionContext(() => {
        const el = document.createElement('div');
        (el as any).getBoundingClientRect = () =>
          ({
            width: 123,
            height: 45,
          }) as DOMRectReadOnly;

        const r = useElementRect(() => el);
        TestBed.tick();
        r.update();

        expect(r.width()).toBe(123);
        expect(r.height()).toBe(45);
      });
    });
  });

  describe('useFocusWithin', () => {
    it('should be true when focus is inside element', () => {
      TestBed.runInInjectionContext(() => {
        const container = document.createElement('div');
        const inside = document.createElement('input');
        const outside = document.createElement('input');
        container.appendChild(inside);
        document.body.appendChild(container);
        document.body.appendChild(outside);

        const focused = useFocusWithin(() => container);
        TestBed.tick();

        inside.focus();
        TestBed.tick();
        expect(focused()).toBe(true);

        outside.focus();
        TestBed.tick();
        expect(focused()).toBe(false);
      });
    });
  });
});

