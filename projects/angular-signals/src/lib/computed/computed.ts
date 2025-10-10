import { computed } from "@angular/core";
import { isEqual } from "lodash-es";

export function deepComputed<T>(computation: () => T) {
  return computed(
    computation, { equal: isEqual }
  );
}
