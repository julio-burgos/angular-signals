import { computed, CreateComputedOptions, CreateEffectOptions, effect, EffectCleanupFn, EffectRef, Signal } from "@angular/core";

export type ComputedSpy<T> = Signal<T> & {
  /** The number of times the computation function has been executed. */
  timesUpdated: number;
};

/** Creates a computed signal that monitors the number of times it is updated. */
export function computedSpy<T>(computation: () => T, options?: CreateComputedOptions<T>): ComputedSpy<T> {
  const output = computed(() => {
    output.timesUpdated++;
    return computation();
  }, options) as ComputedSpy<T>;
  output.timesUpdated = 0;
  return output;
}

export type EffectSpy = EffectRef & {
  /** The number of times the effectFn function has been executed. */
  timesUpdated: number;
};

/** Creates a computed signal that monitors the number of times it is updated. */
export function effectSpy(
  effectFn: (onCleanup: (cleanupFn: EffectCleanupFn) => void) => void,
  options?: CreateEffectOptions
): EffectSpy {
  const output = effect((onCleanup) => {
    output.timesUpdated++;
    return effectFn(onCleanup);
  }, options) as EffectSpy;
  output.timesUpdated = 0;
  return output;
}
