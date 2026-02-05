import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { onClickOutside } from './click-outside';
import { useDocumentVisible } from './document-visible';
import { useIdle } from './idle';
import { usePressedKeys } from './pressed-keys';
import { useGeolocation } from './geolocation';
import { useIsMounted } from './is-mounted';

describe('browser utilities', () => {
  describe('useDocumentVisible', () => {
    it('should update on visibilitychange', () => {
      TestBed.runInInjectionContext(() => {
        let hidden = false;
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          get: () => hidden,
        });

        const isVisible = useDocumentVisible();
        TestBed.tick();
        expect(isVisible()).toBe(true);

        hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        TestBed.tick();
        expect(isVisible()).toBe(false);

        hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        TestBed.tick();
        expect(isVisible()).toBe(true);
      });
    });
  });

  describe('useIdle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should become idle after timeout', () => {
      TestBed.runInInjectionContext(() => {
        const { idle, stop } = useIdle({ timeout: 1000, events: ['mousemove'] });
        TestBed.tick();

        expect(idle()).toBe(false);

        vi.advanceTimersByTime(999);
        expect(idle()).toBe(false);

        vi.advanceTimersByTime(1);
        expect(idle()).toBe(true);

        stop();
      });
    });

    it('should reset idle on activity', () => {
      TestBed.runInInjectionContext(() => {
        const { idle, stop } = useIdle({ timeout: 1000, events: ['mousemove'] });
        TestBed.tick();

        vi.advanceTimersByTime(1000);
        expect(idle()).toBe(true);

        window.dispatchEvent(new Event('mousemove'));
        TestBed.tick();
        expect(idle()).toBe(false);

        stop();
      });
    });
  });

  describe('onClickOutside', () => {
    it('should call handler only for outside events', () => {
      TestBed.runInInjectionContext(() => {
        const target = document.createElement('div');
        const outside = document.createElement('div');
        document.body.appendChild(target);
        document.body.appendChild(outside);

        const handler = vi.fn();
        const api = onClickOutside(() => target, handler, { events: ['mousedown'] });
        TestBed.tick();

        target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();

        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        expect(handler).toHaveBeenCalledTimes(1);

        api.stop();
      });
    });
  });

  describe('usePressedKeys', () => {
    it('should track pressed keys and clear on blur', () => {
      TestBed.runInInjectionContext(() => {
        const pressed = usePressedKeys();
        TestBed.tick();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(pressed.has('a')).toBe(true);
        expect(pressed.keys()).toEqual(['a']);

        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        expect(pressed.has('a')).toBe(false);

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
        window.dispatchEvent(new FocusEvent('blur'));
        expect(pressed.keys()).toEqual([]);
      });
    });
  });

  describe('useGeolocation', () => {
    const originalGeo = (navigator as any).geolocation;

    afterEach(() => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: originalGeo,
      });
    });

    it('should watch position when supported', () => {
      TestBed.runInInjectionContext(() => {
        const watchPosition = vi.fn((success: any) => {
          success({ coords: { latitude: 1, longitude: 2 } } as any);
          return 1;
        });
        const clearWatch = vi.fn();

        Object.defineProperty(navigator, 'geolocation', {
          configurable: true,
          value: { watchPosition, clearWatch },
        });

        const geo = useGeolocation({ immediate: true });
        TestBed.tick();

        expect(geo.isSupported).toBe(true);
        expect(watchPosition).toHaveBeenCalledTimes(1);
        expect(geo.coords()?.latitude).toBe(1);

        geo.stop();
        expect(clearWatch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('useIsMounted', () => {
    it('should start mounted and become false when TestBed is reset', () => {
      const mounted = TestBed.runInInjectionContext(() => useIsMounted());
      expect(mounted()).toBe(true);

      TestBed.resetTestingModule();
      expect(mounted()).toBe(false);
    });
  });
});
