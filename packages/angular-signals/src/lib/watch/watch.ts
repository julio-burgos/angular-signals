import { CreateEffectOptions, effect, EffectCleanupFn, EffectRef, Signal, untracked } from "@angular/core";

export function watch<T>(deps: Signal<any>[], callback:  (clean: void) => void, options?: CreateEffectOptions): EffectRef {
  return effect((onCleanup) => {
    deps.forEach(signal => signal());
    untracked(() => {
      callback();
      return onCleanup(
        () => {
          return undefined as void;
        }
      )
    });
  }, {});
}
