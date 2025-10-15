import { computed, CreateComputedOptions } from "@angular/core";
import { isEqual } from "lodash-es";

export function deepComputed<T>(computation: () => T, options?: CreateComputedOptions<T> | undefined) : ReturnType<typeof computed<T>> {
  return computed(
    computation, { ...options , equal: isEqual }
  );
}
