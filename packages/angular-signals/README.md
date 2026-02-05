# Angular Signals

A TypeScript library that extends Angular's signals API with additional utilities for reactive programming.

## Features

- **Deep Equality Signals**: Signals that use deep equality comparison instead of reference equality
- **Reactive Objects**: Convert plain objects into fine-grained reactive signals for each property
- **Linked Signals**: Signals that compute values from other signals with deep equality
- **Animation Utilities**: Physics-based spring animations and time-based tween animations
- **State Management**: Counter, toggle, array, previous value, and state history utilities
- **Async Utilities**: Debounce and throttle signals
- **Timing Utilities**: Interval, timeout, and now signals
- **Browser APIs**: Media query, event listener, and storage signals
- **Watch Storage**: Subscribe to specific localStorage/sessionStorage key changes
- **Watch Utilities**: Effect utilities for watching multiple signals
- **Element Utilities**: Element size/rect, focus-within, viewport detection, and observer helpers
- **Utility Helpers**: `extract` and `boolAttr`

## Installation

```bash
npm install @angular-signals/angular-signals
```

## API Reference

### Signal Utilities

#### `deepSignal<T>(value: T): WritableSignal<T>`

Creates a signal with deep equality checking.

**Parameters:**
- `value: T` - Initial value for the signal

**Returns:** `WritableSignal<T>` - A writable signal that uses deep equality comparison

**Example:**
```ts
const user = deepSignal({ name: 'John', age: 30 });
user.set({ name: 'John', age: 30 }); // No update (deep equal)
user.set({ name: 'Jane', age: 30 }); // Triggers update
```

#### `deepComputed<T>(computation: () => T): Signal<T>`

Creates a computed signal with deep equality checking.

**Parameters:**
- `computation: () => T` - Function that computes the value

**Returns:** `Signal<T>` - A read-only signal with deep equality

**Example:**
```ts
const user = deepSignal({ name: 'John', age: 30 });
const displayName = deepComputed(() => `${user().name} (${user().age})`);
```

#### `deepLinkedSignal<D>(computation: () => D, options?: { equal?: ValueEqualityFn<D>; debugName?: string }): WritableSignal<D>`

Creates a linked signal with deep equality checking.

**Parameters:**
- `computation: () => D` - The computation function for the linked signal
- `options?: { equal?: ValueEqualityFn<D>; debugName?: string }` - Optional configuration

**Returns:** `WritableSignal<D>` - A writable signal with deep equality comparison

**Example:**
```ts
const count = deepSignal(0);
const doubled = deepLinkedSignal(() => count() * 2);
```

#### `deepLinkedSignal<S, D>(options: { source: () => S; computation: (source: S, previous?: { source: S; value: D }) => D; equal?: ValueEqualityFn<D>; debugName?: string }): WritableSignal<D>`

Creates a linked signal with source and computation, using deep equality checking.

**Parameters:**
- `options.source: () => S` - Source signal function
- `options.computation: (source: S, previous?: { source: S; value: D }) => D` - Computation function
- `options.equal?: ValueEqualityFn<D>` - Optional equality function
- `options.debugName?: string` - Optional debug name

**Returns:** `WritableSignal<D>` - A writable signal with deep equality comparison

**Example:**
```ts
const items = deepSignal([1, 2, 3]);
const sum = deepLinkedSignal({
  source: () => items(),
  computation: (source) => source.reduce((a, b) => a + b, 0)
});
```

#### `reactive<T extends Record<string, unknown>>(initialValue: T): ReactiveObject<T>`

Creates a reactive object where each property becomes an individual signal, providing fine-grained reactivity.

**Parameters:**
- `initialValue: T` - The initial object to make reactive

**Returns:** `ReactiveObject<T>` - A reactive object with signal properties and utility methods

**Type Definition:**
```ts
type ReactiveObject<T extends Record<string, unknown>> = {
  [K in keyof T]: WritableSignal<T[K]>;
} & {
  readonly state: Signal<T>;
  readonly update: (partial: Partial<T>) => void;
  readonly reset: () => void;
};
```

**Example:**
```ts
interface User {
  name: string;
  age: number;
  email: string;
}

const user = reactive<User>({
  name: 'John',
  age: 30,
  email: 'john@example.com'
});

// Access individual signals
console.log(user.name()); // 'John'
console.log(user.age()); // 30

// Update individual properties
user.name.set('Jane');
user.age.update(age => age + 1);

// Get the complete state
console.log(user.state()); // { name: 'Jane', age: 31, email: 'john@example.com' }

// Update multiple properties
user.update({ name: 'Bob', email: 'bob@example.com' });

// Reset to initial values
user.reset();
```

### Animation Utilities

#### `spring<T extends number | number[]>(config: SpringConfig<T>): SpringReturn<T>`

Creates a physics-based spring animation.

**Parameters:**
- `config: SpringConfig<T>` - Spring configuration object

**Returns:** `{ current: Signal<T>, target: WritableSignal<T> }`

**Example:**
```ts
const spring = spring(0, { stiffness: 0.15, damping: 0.8 });
spring.target.set(100); // Animate to 100
console.log(spring.current()); // Current animated value
```

#### `tween<T>(config: TweenConfig<T>): TweenReturn<T>`

Creates a time-based tween animation with easing.

**Parameters:**
- `config: TweenConfig<T>` - Tween configuration object

**Returns:** `{ current: Signal<T>, target: WritableSignal<T> }`

**Example:**
```ts
const tween = tween(0, { duration: 1000, easing: 'easeOut' });
tween.target.set(100); // Animate to 100 over 1 second
```

#### `useAnimationFrames(options?: AnimationFramesOptions): AnimationFramesReturn`

Runs a `requestAnimationFrame` loop and exposes timing signals.

**Parameters:**
- `options?: AnimationFramesOptions` - Optional configuration:
  - `immediate?: boolean` - Start immediately (default: true)
  - `fpsLimit?: number | null | (() => number | null)` - Optional FPS limit

**Returns:** `AnimationFramesReturn` - `{ running, time, delta, frame, start, stop }`

**Example:**
```ts
const frames = useAnimationFrames({ fpsLimit: 30 });
console.log(frames.frame()); // frame count
frames.stop();
```

### State Management

#### `useCounter(initialValue?: number): CounterReturn`

Creates a counter signal with increment/decrement methods.

**Parameters:**
- `initialValue?: number` - Initial counter value (default: 0)

**Returns:** `{ count: Signal<number>, increment: Function, decrement: Function, set: Function }`

#### `useToggle(initialValue?: boolean): ToggleReturn`

Creates a boolean toggle signal.

**Parameters:**
- `initialValue?: boolean` - Initial toggle value (default: false)

**Returns:** `{ value: Signal<boolean>, toggle: Function, set: Function }`

#### `useArray<T>(initialValue?: T[]): ArrayReturn<T>`

Creates an array signal with array manipulation methods.

**Parameters:**
- `initialValue?: T[]` - Initial array value (default: [])

**Returns:** `{ value: Signal<T[]>, push: Function, pop: Function, shift: Function, unshift: Function, splice: Function, filter: Function, clear: Function }`

#### `usePrevious<T>(signal: Signal<T>): Signal<T | undefined>`

Returns the previous value of a signal.

**Parameters:**
- `signal: Signal<T>` - Signal to track

**Returns:** `Signal<T | undefined>` - Signal containing the previous value

#### `useStateHistory<T>(state: WritableSignal<T>, options?: StateHistoryOptions<T>): StateHistoryReturn<T>`

Tracks a writable signal's value changes over time and provides undo/redo functionality.

**Parameters:**
- `state: WritableSignal<T>` - The writable signal to track
- `options?: StateHistoryOptions<T>` - Optional configuration:
  - `maxSize?: number` - Maximum number of snapshots to keep (default: Infinity)
  - `clone?: (value: T) => T` - Clone snapshots before storing (default: identity)
  - `timestamp?: () => number` - Timestamp provider (default: Date.now)

**Returns:** `StateHistoryReturn<T>` - Object with history log signals and controls:
- `log: Signal<readonly { snapshot: T; timestamp: number }[]>` - History log (includes current snapshot)
- `index: Signal<number>` - Current snapshot index
- `canUndo: Signal<boolean>` - Whether undo is possible
- `canRedo: Signal<boolean>` - Whether redo is possible
- `undo(): void` - Restore previous snapshot
- `redo(): void` - Restore next snapshot
- `clear(): void` - Clear history (keeps current snapshot)

**Example:**
```ts
import { signal } from '@angular/core';
import { useStateHistory } from '@angular-signals/angular-signals';

const count = signal(0);
const history = useStateHistory(count, { maxSize: 10 });

count.set(1);
count.set(2);

history.undo(); // count -> 1
history.redo(); // count -> 2
```

### Browser APIs

#### `useDocumentVisible(options?: DocumentVisibleOptions): Signal<boolean>`

Tracks whether the current document is visible.

**Example:**
```ts
const isVisible = useDocumentVisible();
```

#### `useIdle(options?: IdleOptions): IdleReturn`

Tracks whether the user is idle based on activity events.

**Returns:** `{ idle, lastActive, reset, stop }`

#### `onClickOutside(target, handler, options?): ClickOutsideReturn`

Calls a handler when an event occurs outside the target element.

#### `usePressedKeys(options?: PressedKeysOptions): PressedKeysReturn`

Tracks currently pressed keys.

**Returns:** `{ keys, has, onKeys, clear }`

#### `useGeolocation(options?: GeolocationOptions): GeolocationReturn`

Watches geolocation coordinates.

**Returns:** `{ isSupported, isWatching, coords, error, start, stop }`

#### `useIsMounted(): Signal<boolean>`

Signal that becomes `false` when the injection context is destroyed.

### Element Utilities

#### `useActiveElement(options?: ActiveElementOptions): Signal<Element | null>`

Tracks the current active element.

#### `useElementRect(target): ElementRectReturn`

Tracks an element’s bounding client rect.

**Returns:** `{ rect, width, height, update }`

#### `useElementSize(target): ElementSizeReturn`

Tracks an element’s size (width/height).

#### `useFocusWithin(target): Signal<boolean>`

Tracks whether focus is within a given element.

#### `useInViewport(target, options?): InViewportReturn`

Tracks whether an element is in the viewport.

#### `useResizeObserver(target, callback, options?): ObserverReturn`
#### `useMutationObserver(target, callback, options): ObserverReturn`
#### `useIntersectionObserver(target, callback, options?): ObserverReturn`

Observer helpers with automatic cleanup.

### Utility Helpers

#### `extract<T>(value: T | (() => T)): T`

Resolves a direct value or getter (including signals).

#### `boolAttr(value: unknown): boolean`

Parses boolean-attribute-like values.

### Async Utilities

#### `useDebounce<T>(signal: Signal<T>, delay: number): Signal<T | undefined>`

Debounces a signal's value changes.

**Parameters:**
- `signal: Signal<T>` - Signal to debounce
- `delay: number` - Debounce delay in milliseconds

**Returns:** `Signal<T | undefined>` - Debounced signal

#### `useThrottle<T>(signal: Signal<T>, delay: number): Signal<T | undefined>`

Throttles a signal's value changes.

**Parameters:**
- `signal: Signal<T>` - Signal to throttle
- `delay: number` - Throttle delay in milliseconds

**Returns:** `Signal<T | undefined>` - Throttled signal

### Timing Utilities

#### `useInterval(callback: Function, delay: number): { start: Function, stop: Function }`

Creates a controllable interval.

**Parameters:**
- `callback: Function` - Function to call on each interval
- `delay: number` - Interval delay in milliseconds

**Returns:** `{ start: Function, stop: Function }`

#### `useTimeout(callback: Function, delay: number): { start: Function, stop: Function }`

Creates a controllable timeout.

**Parameters:**
- `callback: Function` - Function to call after delay
- `delay: number` - Timeout delay in milliseconds

**Returns:** `{ start: Function, stop: Function }`

#### `useNow(): Signal<number>`

Returns a signal with the current timestamp, updated on each change detection cycle.

**Returns:** `Signal<number>` - Current timestamp

### Browser APIs

#### `useMediaQuery(query: string): Signal<boolean>`

Creates a signal that tracks a media query's match state.

**Parameters:**
- `query: string` - CSS media query string

**Returns:** `Signal<boolean>` - Whether the media query matches

#### `useEventListener<T extends Event>(target: EventTarget, type: string, listener?: (event: T) => void): void`

Sets up an event listener that automatically cleans up.

**Parameters:**
- `target: EventTarget` - Event target
- `type: string` - Event type
- `listener?: (event: T) => void` - Event listener function

#### `useLocalStorage<T>(key: string, initialValue: T): StorageReturn<T>`

Creates a signal synced with localStorage.

**Parameters:**
- `key: string` - Storage key
- `initialValue: T` - Initial value if key doesn't exist

**Returns:** `{ value: WritableSignal<T>, remove: Function }`

#### `useSessionStorage<T>(key: string, initialValue: T): StorageReturn<T>`

Creates a signal synced with sessionStorage.

**Parameters:**
- `key: string` - Storage key
- `initialValue: T` - Initial value if key doesn't exist

**Returns:** `{ value: WritableSignal<T>, remove: Function }`

#### `watchStorageKey<T>(storage: Storage, key: string): Signal<T | undefined>`

Creates a signal that watches for changes to a specific storage key from any tab/window.

**Parameters:**
- `storage: Storage` - Storage object (localStorage or sessionStorage)
- `key: string` - Storage key to watch

**Returns:** `Signal<T | undefined>` - Signal containing the current value of the storage key

**Example:**
```ts
const theme = watchStorageKey(localStorage, 'theme');

// Signal updates automatically when 'theme' key changes in any tab
effect(() => {
  console.log('Theme changed:', theme());
});
```

#### `watchLocalStorageKey<T>(key: string): Signal<T | undefined>`

Creates a signal that watches for changes to a specific localStorage key.

**Parameters:**
- `key: string` - localStorage key to watch

**Returns:** `Signal<T | undefined>` - Signal containing the current value of the localStorage key

**Example:**
```ts
const userPrefs = watchLocalStorageKey('user-preferences');

effect(() => {
  const prefs = userPrefs();
  if (prefs) {
    applyPreferences(prefs);
  }
});
```

#### `watchSessionStorageKey<T>(key: string): Signal<T | undefined>`

Creates a signal that watches for changes to a specific sessionStorage key.

**Parameters:**
- `key: string` - sessionStorage key to watch

**Returns:** `Signal<T | undefined>` - Signal containing the current value of the sessionStorage key

**Example:**
```ts
const sessionData = watchSessionStorageKey('temp-data');

effect(() => {
  console.log('Session data:', sessionData());
});
```

## Watch Utilities

#### `watch<T>(deps: Signal<any>[], callback: (clean: void) => void, options?: CreateEffectOptions): EffectRef`

Creates an effect that runs when any of the dependency signals change.

**Parameters:**
- `deps: Signal<any>[]` - Array of signals to watch
- `callback: (clean: void) => void` - Function to call when dependencies change
- `options?: CreateEffectOptions` - Optional effect configuration

**Returns:** `EffectRef` - Effect reference for cleanup

**Example:**
```ts
const count = signal(0);
const name = signal('John');

watch([count, name], () => {
  console.log('Count or name changed:', count(), name());
});
```
