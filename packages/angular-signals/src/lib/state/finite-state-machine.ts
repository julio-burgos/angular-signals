import { signal, Signal, untracked } from '@angular/core';

export interface StateTransitionMeta<S extends string, E extends string> {
  from: S;
  to: S;
  event: E;
  args: unknown[];
}

export type StateTransitionHandler<S extends string, E extends string> = (
  meta: StateTransitionMeta<S, E>
) => void;

export type StateTransition<S extends string, E extends string> =
  | S
  | ((...args: unknown[]) => S | void);

export type StateDefinition<S extends string, E extends string> = Partial<
  Record<E, StateTransition<S, E>>
> & {
  _enter?: StateTransitionHandler<S, E>;
  _exit?: StateTransitionHandler<S, E>;
};

export type MachineDefinition<S extends string, E extends string> = Record<
  S,
  StateDefinition<S, E>
> &
  Partial<Record<'*', StateDefinition<S, E>>>;

export class FiniteStateMachine<S extends string, E extends string> {
  private readonly _state = signal<S>(null as any);
  private readonly _definition: MachineDefinition<S, E>;
  private readonly _debounced = new Map<string, ReturnType<typeof setTimeout>>();

  readonly state: Signal<S>;

  constructor(initial: S, definition: MachineDefinition<S, E>) {
    this._definition = definition;
    this._state.set(initial);
    this.state = this._state.asReadonly();
  }

  is(...states: S[]): boolean {
    const s = this._state();
    return states.includes(s);
  }

  can(event: E): boolean {
    const s = this._state();
    return Boolean(
      this._definition[s]?.[event] ?? this._definition['*']?.[event]
    );
  }

  send(event: E, ...args: unknown[]): void {
    const from = this._state();
    const def = this._definition[from];
    const wildcard = this._definition['*'];
    const transition = def?.[event] ?? wildcard?.[event];
    if (!transition) return;

    const resolved =
      typeof transition === 'function' ? transition(...args) : transition;
    const to = (resolved ?? from) as S;
    if (to === from) return;

    const meta: StateTransitionMeta<S, E> = { from, to, event, args };

    untracked(() => {
      def?._exit?.(meta);
      wildcard?._exit?.(meta);
      this._state.set(to);
      this._definition[to]?._enter?.(meta);
      wildcard?._enter?.(meta);
    });
  }

  debounce(ms: number, event: E, ...args: unknown[]): void {
    const key = String(event);
    const existing = this._debounced.get(key);
    if (existing) clearTimeout(existing);
    const id = setTimeout(() => {
      this._debounced.delete(key);
      this.send(event, ...args);
    }, Math.max(0, ms));
    this._debounced.set(key, id);
  }

  clearDebounce(event?: E): void {
    if (!event) {
      for (const id of this._debounced.values()) clearTimeout(id);
      this._debounced.clear();
      return;
    }
    const key = String(event);
    const existing = this._debounced.get(key);
    if (existing) clearTimeout(existing);
    this._debounced.delete(key);
  }
}

/**
 * Creates a finite state machine with a reactive `state` signal.
 */
export function createFiniteStateMachine<S extends string, E extends string>(
  initial: S,
  definition: MachineDefinition<S, E>
): FiniteStateMachine<S, E> {
  return new FiniteStateMachine(initial, definition);
}
