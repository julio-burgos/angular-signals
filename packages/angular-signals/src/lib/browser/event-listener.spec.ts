import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { useEventListener } from './event-listener';

describe('useEventListener', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should add event listener to window', () => {
    TestBed.runInInjectionContext(() => {
      const handler = vi.fn();
      useEventListener(window, 'resize', handler);

      TestBed.tick();
      window.dispatchEvent(new Event('resize'));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('should add event listener to document', () => {
    TestBed.runInInjectionContext(() => {
      const handler = vi.fn();
      useEventListener(document, 'click', handler);

      TestBed.tick();
      document.dispatchEvent(new Event('click'));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('should add event listener to element', () => {
    TestBed.runInInjectionContext(() => {
      const element = document.createElement('button');
      const handler = vi.fn();

      useEventListener(element, 'click', handler);

      TestBed.tick();
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  it('should support reactive target', () => {
    TestBed.runInInjectionContext(() => {
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      const targetSignal = signal<HTMLElement | null>(element1);
      const handler = vi.fn();

      useEventListener(targetSignal, 'click', handler);

      TestBed.tick();
      element1.click();
      expect(handler).toHaveBeenCalledTimes(1);

      targetSignal.set(element2);
      TestBed.tick();

      element2.click();
      expect(handler).toHaveBeenCalledTimes(2); // Now listening to element2
    });
  });

  it('should handle null target', () => {
    TestBed.runInInjectionContext(() => {
      const targetSignal = signal<HTMLElement | null>(null);
      const handler = vi.fn();

      expect(() => {
        useEventListener(targetSignal, 'click', handler);
      }).not.toThrow();
    });
  });

  it('should pass event to handler', () => {
    TestBed.runInInjectionContext(() => {
      const element = document.createElement('button');
      let receivedEvent: any;

      useEventListener(element, 'click', (event) => {
        receivedEvent = event;
      });

      TestBed.tick();
      element.click();

      expect(receivedEvent).toBeInstanceOf(MouseEvent);
      expect(receivedEvent?.type).toBe('click');
    });
  });
});
