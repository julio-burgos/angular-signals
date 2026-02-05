import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { useAnimationFrames } from './animation-frames';

describe('useAnimationFrames', () => {
  let originalRequestAnimationFrame: typeof globalThis.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof globalThis.cancelAnimationFrame;
  let queue: FrameRequestCallback[];

  beforeEach(() => {
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

    queue = [];
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      queue.push(cb);
      return queue.length;
    }) as any;
    globalThis.cancelAnimationFrame = ((id: number) => {
      const idx = id - 1;
      if (queue[idx]) queue[idx] = () => {};
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
      expect(queue.length).toBeGreaterThan(0);

      const first = queue.shift()!;
      first(16);
      expect(frames.frame()).toBeGreaterThan(0);

      frames.stop();
      expect(frames.running()).toBe(false);
    });
  });
});
