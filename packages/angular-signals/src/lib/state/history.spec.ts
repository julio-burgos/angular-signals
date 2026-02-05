import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { useStateHistory } from './history';

describe('useStateHistory', () => {
  it('should initialize with a single snapshot', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state);

      expect(history.log().length).toBe(1);
      expect(history.log()[0]?.snapshot).toBe(0);
      expect(history.index()).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  it('should append snapshots when state changes', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state, { timestamp: () => 123 });

      TestBed.tick(); // flush initial effect
      state.set(1);
      TestBed.tick();

      expect(history.log().map(e => e.snapshot)).toEqual([0, 1]);
      expect(history.log().map(e => e.timestamp)).toEqual([123, 123]);
      expect(history.index()).toBe(1);
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(false);
    });
  });

  it('should undo and redo without creating new snapshots', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state);

      TestBed.tick();
      state.set(1);
      TestBed.tick();
      state.set(2);
      TestBed.tick();

      expect(history.log().map(e => e.snapshot)).toEqual([0, 1, 2]);
      expect(state()).toBe(2);

      history.undo();
      TestBed.tick();
      expect(state()).toBe(1);
      expect(history.index()).toBe(1);
      expect(history.canUndo()).toBe(true);
      expect(history.canRedo()).toBe(true);
      expect(history.log().map(e => e.snapshot)).toEqual([0, 1, 2]);

      history.redo();
      TestBed.tick();
      expect(state()).toBe(2);
      expect(history.index()).toBe(2);
      expect(history.canRedo()).toBe(false);
      expect(history.log().map(e => e.snapshot)).toEqual([0, 1, 2]);
    });
  });

  it('should drop redo history when state changes after undo', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state);

      TestBed.tick();
      state.set(1);
      TestBed.tick();
      state.set(2);
      TestBed.tick();

      history.undo(); // back to 1
      TestBed.tick();
      expect(state()).toBe(1);
      expect(history.canRedo()).toBe(true);

      state.set(99); // new branch
      TestBed.tick();

      expect(history.log().map(e => e.snapshot)).toEqual([0, 1, 99]);
      expect(history.index()).toBe(2);
      expect(history.canRedo()).toBe(false);
    });
  });

  it('should respect maxSize by trimming the oldest entries', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state, { maxSize: 3 });

      TestBed.tick();
      state.set(1);
      TestBed.tick();
      state.set(2);
      TestBed.tick();
      state.set(3);
      TestBed.tick();
      state.set(4);
      TestBed.tick();

      expect(history.log().map(e => e.snapshot)).toEqual([2, 3, 4]);
      expect(history.index()).toBe(2);
      expect(history.canUndo()).toBe(true);
    });
  });

  it('should clear history and keep current value as the only snapshot', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state);

      TestBed.tick();
      state.set(1);
      TestBed.tick();
      state.set(2);
      TestBed.tick();

      history.clear();

      expect(history.log().length).toBe(1);
      expect(history.log()[0]?.snapshot).toBe(2);
      expect(history.index()).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  it('should support getter + setter overload', () => {
    TestBed.runInInjectionContext(() => {
      const state = signal(0);
      const history = useStateHistory(state.asReadonly(), v => state.set(v));

      TestBed.tick();
      state.set(1);
      TestBed.tick();
      state.set(2);
      TestBed.tick();

      history.undo();
      TestBed.tick();
      expect(state()).toBe(1);
    });
  });
});

