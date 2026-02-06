import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createFiniteStateMachine } from './finite-state-machine';

describe('FiniteStateMachine', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should transition on send', () => {
    const fsm = createFiniteStateMachine<'a' | 'b', 'next'>('a', {
      a: { next: 'b' },
      b: { next: 'a' },
    });

    expect(fsm.state()).toBe('a');
    fsm.send('next');
    expect(fsm.state()).toBe('b');
  });

  it('should debounce transitions', () => {
    const fsm = createFiniteStateMachine<'a' | 'b', 'next'>('a', {
      a: { next: 'b' },
      b: { next: 'a' },
    });

    fsm.debounce(100, 'next');
    vi.advanceTimersByTime(99);
    expect(fsm.state()).toBe('a');

    vi.advanceTimersByTime(1);
    expect(fsm.state()).toBe('b');
  });
});

