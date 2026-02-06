import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createContext } from './context';

describe('createContext', () => {
  it('should inject a provided value', () => {
    const Theme = createContext<string>('Theme');

    TestBed.configureTestingModule({
      providers: [Theme.provide('dark')],
    });

    const value = TestBed.runInInjectionContext(() => Theme.get());
    expect(value).toBe('dark');
  });

  it('should throw a friendly error when missing', () => {
    const Ctx = createContext<number>('MissingCtx');

    TestBed.configureTestingModule({ providers: [] });

    expect(() => TestBed.runInInjectionContext(() => Ctx.get())).toThrow(
      /Missing provider for context "MissingCtx"/
    );
  });

  it('should return a fallback when missing', () => {
    const Ctx = createContext<number>('OptionalCtx');

    TestBed.configureTestingModule({ providers: [] });

    const value = TestBed.runInInjectionContext(() => Ctx.getOr(123));
    expect(value).toBe(123);
  });

  it('should support signals as context values', () => {
    const CounterCtx = createContext<WritableSignal<number>>('CounterCtx');

    const counter = signal(0);

    TestBed.configureTestingModule({
      providers: [CounterCtx.provide(counter)],
    });

    TestBed.runInInjectionContext(() => {
      const injected = CounterCtx.get();
      injected.set(2);
    });

    expect(counter()).toBe(2);
  });

  it('should report exists() false when missing', () => {
    const Ctx = createContext<string>('ExistsCtx');

    TestBed.configureTestingModule({ providers: [] });
    expect(TestBed.runInInjectionContext(() => Ctx.exists())).toBe(false);
  });

  it('should report exists() true when provided', () => {
    const Ctx = createContext<string>('ExistsCtxProvided');

    TestBed.configureTestingModule({ providers: [Ctx.provide('x')] });
    expect(TestBed.runInInjectionContext(() => Ctx.exists())).toBe(true);
  });
});
