import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useTextareaAutosize } from './textarea-autosize';

describe('useTextareaAutosize', () => {
  it('should set height based on scrollHeight', () => {
    TestBed.runInInjectionContext(() => {
      const el = document.createElement('textarea');
      document.body.appendChild(el);

      Object.defineProperty(el, 'scrollHeight', {
        configurable: true,
        get: () => 120,
      });

      const api = useTextareaAutosize(() => el);
      TestBed.tick();

      api.update();
      expect(el.style.height).toBe('120px');
      api.stop();
    });
  });
});

