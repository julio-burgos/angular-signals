import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useAnimationFrames } from './animation-frames';

describe('useAnimationFrames', () => {
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
  let nextId: number;
  let callbacks: Map<number, FrameRequestCallback>;

  beforeEach(() => {
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

    nextId = 0;
    callbacks = new Map();
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      nextId++;
      callbacks.set(nextId, cb);
      return nextId;
    }) as any;
    globalThis.cancelAnimationFrame = ((id: number) => {
      callbacks.delete(id);
    }) as any;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('should advance frames when running', () => {
    TestBed.runInInjectionContext(() => {
      const frames = useAnimationFrames({ immediate: true });
      TestBed.tick();

      expect(frames.running()).toBe(true);
      expect(frames.frame()).toBe(0);
      expect(callbacks.size).toBeGreaterThan(0);

      const first = callbacks.entries().next().value as
        | [number, FrameRequestCallback]
        | undefined;
      expect(first).toBeTruthy();
      callbacks.delete(first![0]);
      first![1](16);
      expect(frames.frame()).toBeGreaterThan(0);

      frames.stop();
      expect(frames.running()).toBe(false);
    });
  });
});
