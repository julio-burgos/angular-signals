import { linkedSignal, WritableSignal } from "@angular/core";

import {ValueEqualityFn } from "@angular/core";
import { isEqual } from "lodash-es";

/**
 * Creates a linked signal with deep equality checking using lodash's isEqual.
 *
 * @param computation - The computation function for the linked signal
 * @param options - Optional configuration (debugName will be preserved, equal will be set to deep equality)
 * @returns A writable signal with deep equality comparison
 */
export function deepLinkedSignal<D>(
  computation: () => D,
  options?: { equal?: ValueEqualityFn<D>; debugName?: string }
): WritableSignal<D>;

/**
 * Creates a linked signal with source and computation, using deep equality checking.
 *
 * @param options - Configuration object with source, computation, and optional debugName
 * @returns A writable signal with deep equality comparison
 */
export function deepLinkedSignal<S, D>(options: {
  source: () => S;
  computation: (source: S, previous?: { source: S; value: D }) => D;
  equal?: ValueEqualityFn<D>;
  debugName?: string;
}): WritableSignal<D>;

// Implementation
export function deepLinkedSignal<S, D>(
  computationOrOptions: (() => D) | {
    source: () => S;
    computation: (source: S, previous?: { source: S; value: D }) => D;
    equal?: ValueEqualityFn<D>;
    debugName?: string;
  },
  options?: { equal?: ValueEqualityFn<D>; debugName?: string }
): WritableSignal<D> {
  if (typeof computationOrOptions === 'function') {
    // First overload: computation function only
    return linkedSignal(computationOrOptions, { ...options, equal: isEqual });
  } else {
    // Second overload: options object with source and computation
    return linkedSignal({ ...computationOrOptions, equal: isEqual });
  }
}

