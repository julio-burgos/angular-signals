import { computed, effect, signal, Signal, untracked, WritableSignal } from '@angular/core';

export interface StateHistoryEntry<T> {
  snapshot: T;
  timestamp: number;
}

export interface StateHistoryOptions<T> {
  /**
   * Maximum number of entries to keep in the history log (default: Infinity).
   * When exceeded, the oldest entries are removed.
   */
  maxSize?: number;
  /**
   * Optional function to clone snapshots before storing them.
   * Useful when your state contains mutable objects (default: identity).
   */
  clone?: (value: T) => T;
  /**
   * Timestamp provider for log entries (default: Date.now).
   */
  timestamp?: () => number;
}

export interface StateHistoryReturn<T> {
  /** Full history log (includes the current snapshot). */
  log: Signal<readonly StateHistoryEntry<T>[]>;
  /** Index of the current snapshot within `log`. */
  index: Signal<number>;
  /** Whether `undo()` can move to a previous snapshot. */
  canUndo: Signal<boolean>;
  /** Whether `redo()` can move to a later snapshot. */
  canRedo: Signal<boolean>;
  /** Restore the previous snapshot (if available). */
  undo: () => void;
  /** Restore the next snapshot (if available). */
  redo: () => void;
  /** Clear history (keeps the current value as the only snapshot). */
  clear: () => void;
}

type StateSetter<T> = (value: T) => void;

/**
 * Tracks a signal's value changes over time and provides undo/redo functionality.
 *
 * @param state - The writable signal to track
 * @param options - Optional configuration
 * @returns Object with history log signals and undo/redo controls
 *
 * @example
 * ```ts
 * const count = signal(0);
 * const history = useStateHistory(count);
 *
 * count.set(1);
 * count.set(2);
 *
 * history.undo(); // count becomes 1
 * history.redo(); // count becomes 2
 * ```
 */
export function useStateHistory<T>(
  state: WritableSignal<T>,
  options?: StateHistoryOptions<T>
): StateHistoryReturn<T>;

/**
 * Tracks a signal-like getter with a setter function.
 *
 * @param source - The signal (read-only) to track
 * @param set - Setter that applies a snapshot
 * @param options - Optional configuration
 * @returns Object with history log signals and undo/redo controls
 */
export function useStateHistory<T>(
  source: Signal<T>,
  set: StateSetter<T>,
  options?: StateHistoryOptions<T>
): StateHistoryReturn<T>;

export function useStateHistory<T>(
  source: Signal<T> | WritableSignal<T>,
  setOrOptions?: StateSetter<T> | StateHistoryOptions<T>,
  maybeOptions?: StateHistoryOptions<T>
): StateHistoryReturn<T> {
  const set: StateSetter<T> =
    typeof setOrOptions === 'function'
      ? setOrOptions
      : (source as WritableSignal<T>).set.bind(source);

  const options: StateHistoryOptions<T> =
    (typeof setOrOptions === 'function' ? maybeOptions : setOrOptions) ?? {};

  const clone = options.clone ?? ((value: T) => value);
  const timestamp = options.timestamp ?? (() => Date.now());

  const normalizedMaxSizeRaw = options.maxSize ?? Infinity;
  const normalizedMaxSize =
    Number.isFinite(normalizedMaxSizeRaw) && normalizedMaxSizeRaw > 0
      ? Math.floor(normalizedMaxSizeRaw)
      : Infinity;

  const log = signal<readonly StateHistoryEntry<T>[]>([
    { snapshot: clone(source()), timestamp: timestamp() },
  ]);
  const index = signal(0);

  let skipNextRecord = false;
  let isFirstRun = true;

  effect(() => {
    const currentValue = source();

    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    if (skipNextRecord) {
      skipNextRecord = false;
      return;
    }

    const currentLog = untracked(() => log());
    const currentIndex = untracked(() => index());

    const baseLog =
      currentIndex < currentLog.length - 1
        ? currentLog.slice(0, currentIndex + 1)
        : currentLog;

    let nextLog = [
      ...baseLog,
      { snapshot: clone(currentValue), timestamp: timestamp() },
    ];

    let nextIndex = nextLog.length - 1;

    if (nextLog.length > normalizedMaxSize) {
      const overflow = nextLog.length - normalizedMaxSize;
      nextLog = nextLog.slice(overflow);
      nextIndex = Math.max(0, nextIndex - overflow);
    }

    untracked(() => {
      log.set(nextLog);
      index.set(nextIndex);
    });
  });

  const restoreTo = (nextIndex: number) => {
    const nextEntry = untracked(() => log()[nextIndex]);
    if (!nextEntry) return;

    skipNextRecord = true;
    untracked(() => index.set(nextIndex));
    set(nextEntry.snapshot);
  };

  return {
    log: log.asReadonly(),
    index: index.asReadonly(),
    canUndo: computed(() => index() > 0),
    canRedo: computed(() => index() < log().length - 1),
    undo: () => {
      const currentIndex = untracked(() => index());
      if (currentIndex <= 0) return;
      restoreTo(currentIndex - 1);
    },
    redo: () => {
      const currentIndex = untracked(() => index());
      const currentLogLength = untracked(() => log().length);
      if (currentIndex >= currentLogLength - 1) return;
      restoreTo(currentIndex + 1);
    },
    clear: () => {
      const currentValue = untracked(() => source());
      untracked(() => {
        log.set([{ snapshot: clone(currentValue), timestamp: timestamp() }]);
        index.set(0);
      });
    },
  };
}
