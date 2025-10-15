import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { effect, provideZonelessChangeDetection } from '@angular/core';
import { useCounter } from './counter';

describe('useCounter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should initialize with 0 by default', () => {
    const counter = useCounter();
    expect(counter.count()).toBe(0);
  });

  it('should initialize with provided value', () => {
    const counter = useCounter(10);
    expect(counter.count()).toBe(10);
  });

  it('should increment by 1 by default', () => {
    const counter = useCounter(5);

    counter.increment();
    expect(counter.count()).toBe(6);

    counter.increment();
    expect(counter.count()).toBe(7);
  });

  it('should increment by custom step', () => {
    const counter = useCounter(0);

    counter.increment(5);
    expect(counter.count()).toBe(5);

    counter.increment(10);
    expect(counter.count()).toBe(15);
  });

  it('should decrement by 1 by default', () => {
    const counter = useCounter(5);

    counter.decrement();
    expect(counter.count()).toBe(4);

    counter.decrement();
    expect(counter.count()).toBe(3);
  });

  it('should decrement by custom step', () => {
    const counter = useCounter(20);

    counter.decrement(5);
    expect(counter.count()).toBe(15);

    counter.decrement(10);
    expect(counter.count()).toBe(5);
  });

  it('should reset to initial value', () => {
    const counter = useCounter(10);

    counter.increment(5);
    expect(counter.count()).toBe(15);

    counter.reset();
    expect(counter.count()).toBe(10);
  });

  it('should reset to specified value', () => {
    const counter = useCounter(10);

    counter.increment(5);

    counter.reset(0);
    expect(counter.count()).toBe(0);
  });

  it('should set to specific value', () => {
    const counter = useCounter(0);

    counter.set(100);
    expect(counter.count()).toBe(100);
  });

  it('should respect minimum bound', () => {
    const counter = useCounter(5, 0, 10);

    counter.decrement(10);
    expect(counter.count()).toBe(0);

    counter.set(-5);
    expect(counter.count()).toBe(0);
  });

  it('should respect maximum bound', () => {
    const counter = useCounter(5, 0, 10);

    counter.increment(10);
    expect(counter.count()).toBe(10);

    counter.set(20);
    expect(counter.count()).toBe(10);
  });

  it('should clamp initial value to bounds', () => {
    const counterMin = useCounter(-10, 0, 10);
    expect(counterMin.count()).toBe(0);

    const counterMax = useCounter(20, 0, 10);
    expect(counterMax.count()).toBe(10);
  });

  it('should trigger effect on change', () => {
    TestBed.runInInjectionContext(() => {
      const counter = useCounter(0);
      let effectCount = 0;
      let lastValue = 0;

      effect(() => {
        lastValue = counter.count();
        effectCount++;
      });

      TestBed.tick();
      expect(effectCount).toBe(1);
      expect(lastValue).toBe(0);

      counter.increment();
      TestBed.tick();
      expect(effectCount).toBe(2);
      expect(lastValue).toBe(1);
    });
  });
});
