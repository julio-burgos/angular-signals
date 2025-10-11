import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { effect, provideZonelessChangeDetection } from '@angular/core';
import { useToggle } from './toggle';

describe('useToggle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should initialize with false by default', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle();
      expect(toggle.value()).toBe(false);
    });
  });

  it('should initialize with provided value', () => {
    TestBed.runInInjectionContext(() => {
      const toggleTrue = useToggle(true);
      expect(toggleTrue.value()).toBe(true);

      const toggleFalse = useToggle(false);
      expect(toggleFalse.value()).toBe(false);
    });
  });

  it('should toggle value', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle(false);

      toggle.toggle();
      expect(toggle.value()).toBe(true);

      toggle.toggle();
      expect(toggle.value()).toBe(false);

      toggle.toggle();
      expect(toggle.value()).toBe(true);
    });
  });

  it('should set to true', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle(false);

      toggle.setTrue();
      expect(toggle.value()).toBe(true);

      toggle.setTrue();
      expect(toggle.value()).toBe(true);
    });
  });

  it('should set to false', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle(true);

      toggle.setFalse();
      expect(toggle.value()).toBe(false);

      toggle.setFalse();
      expect(toggle.value()).toBe(false);
    });
  });

  it('should trigger effect on change', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle(false);
      let effectCount = 0;
      let lastValue = false;

      effect(() => {
        lastValue = toggle.value();
        effectCount++;
      });

      TestBed.flushEffects();
      expect(effectCount).toBe(1);
      expect(lastValue).toBe(false);

      toggle.toggle();
      TestBed.flushEffects();
      expect(effectCount).toBe(2);
      expect(lastValue).toBe(true);

      toggle.setFalse();
      TestBed.flushEffects();
      expect(effectCount).toBe(3);
      expect(lastValue).toBe(false);
    });
  });

  it('should not trigger effect when value does not change', () => {
    TestBed.runInInjectionContext(() => {
      const toggle = useToggle(true);
      let effectCount = 0;

      effect(() => {
        toggle.value();
        effectCount++;
      });

      TestBed.flushEffects();
      expect(effectCount).toBe(1);

      toggle.setTrue();
      TestBed.flushEffects();
      expect(effectCount).toBe(1); // No change

      toggle.setFalse();
      TestBed.flushEffects();
      expect(effectCount).toBe(2); // Changed

      toggle.setFalse();
      TestBed.flushEffects();
      expect(effectCount).toBe(2); // No change
    });
  });
});
