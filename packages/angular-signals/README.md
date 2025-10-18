# Angular Signals

A TypeScript library that extends Angular's signals API with additional utilities for reactive programming.

## Features

- **Deep Equality Signals**: Signals that use deep equality comparison instead of reference equality
- **Animation Utilities**: Physics-based spring animations and time-based tween animations
- **State Management**: Counter, toggle, array, and previous value signals
- **Async Utilities**: Debounce and throttle signals
- **Timing Utilities**: Interval, timeout, and now signals
- **Browser APIs**: Media query, event listener, and storage signals
- **Watch Storage**: Subscribe to specific localStorage/sessionStorage key changes

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

## Demo

Run the demo application to see all utilities in action:

```bash
npm start
```

Then open http://localhost:4200 in your browser.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## License

MIT
