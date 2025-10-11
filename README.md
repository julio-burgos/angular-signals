# Angular Signals

[![CI/CD](https://github.com/yourusername/angular-signals/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/angular-signals/actions/workflows/ci-cd.yml)
[![npm version](https://badge.fury.io/js/angular-signals.svg)](https://www.npmjs.com/package/angular-signals)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced Angular signals library with deep equality checking, animations, state management, async utilities, timing functions, and browser API integrations.

## Features

### Core Signals
- 🔵 **deepSignal** - Signals with deep equality checking using lodash
- ⚡ **deepComputed** - Computed signals with deep equality comparison

### State Management
- 📊 **usePrevious** - Track previous value of a signal
- 🔄 **useToggle** - Boolean toggle with convenience methods
- 🔢 **useCounter** - Counter with optional min/max bounds
- 📝 **useArray** - Array manipulation with immutable operations

### Async Utilities
- ⏱️ **useDebounce** - Debounce signal value changes
- 🚦 **useThrottle** - Throttle signal update frequency

### Timing Utilities
- ⏰ **useInterval** - Interval timer with pause/resume/reset
- ⏲️ **useTimeout** - Timeout with cancel/reset capabilities
- 🕐 **useNow** - Current timestamp signal with auto-updates

### Browser APIs
- 📱 **useMediaQuery** - Reactive media query matching
- 👂 **useEventListener** - Event listener with automatic cleanup
- 💾 **useLocalStorage** - Sync signal with localStorage
- 🗂️ **useSessionStorage** - Sync signal with sessionStorage

### Animations
- 🌀 **spring** - Physics-based animations with stiffness and damping
- ⏱️ **tween** - Time-based animations with duration, delay, and easing

## Installation

```bash
npm install angular-signals lodash-es
```

## Quick Start

```typescript
import { deepSignal, deepComputed, spring, tween } from 'angular-signals';

// Deep equality signals
const user = deepSignal({
  name: 'John',
  address: { city: 'NYC' }
});

// Deep computed values
const summary = deepComputed(() => {
  const u = user();
  return `${u.name} from ${u.address.city}`;
});

// Spring animations
const { current, target } = spring(0, { 
  stiffness: 0.15, 
  damping: 0.8 
});

// Tween animations
const { current, target } = tween(0, { 
  duration: 1000,
  delay: 500,
  easing: (t) => t * t
});
```

## API Reference

### deepSignal<T>(value: T): WritableSignal<T>

Creates a signal with deep equality checking. Only triggers updates when the deep value actually changes.

```typescript
const state = deepSignal({
  user: {
    name: 'Alice',
    settings: {
      theme: 'dark'
    }
  }
});

// This won't trigger effects if the deep value is the same
state.set({ user: { name: 'Alice', settings: { theme: 'dark' } } });

// This will trigger effects
state.update(s => ({
  ...s,
  user: { ...s.user, name: 'Bob' }
}));
```

### deepComputed<T>(computation: () => T): Signal<T>

Creates a computed signal with deep equality checking. Only re-emits when the computed value is deeply different.

```typescript
const user = deepSignal({ firstName: 'John', lastName: 'Doe' });

const fullName = deepComputed(() => {
  const u = user();
  return { display: `${u.firstName} ${u.lastName}` };
});
```

### spring(initialValue, config): { current, target }

Creates a physics-based spring animation.

**Parameters:**
- `initialValue: number | number[]` - Initial value
- `config.stiffness?: number` - Spring stiffness (default: 0.15)
- `config.damping?: number` - Spring damping (default: 0.8)
- `config.precision?: number` - Animation precision (default: 0.01)

**Returns:**
- `current: Signal<T>` - Readonly current animated value
- `target: WritableSignal<T>` - Writable target value

```typescript
// Single value spring
const { current, target } = spring(0, { 
  stiffness: 0.15, 
  damping: 0.8 
});

target.set(100); // Animates smoothly to 100

// 2D/3D spring
const position = spring([0, 0, 0], { stiffness: 0.2 });
position.target.set([100, 50, 25]);
```

### tween(initialValue, options): { current, target }

Creates a time-based tween animation.

**Parameters:**
- `initialValue: number | number[]` - Initial value
- `options.duration: number` - Animation duration in milliseconds
- `options.delay?: number` - Delay before animation starts (default: 0)
- `options.easing?: (t: number) => number` - Easing function (default: linear)
- `options.interpolate?: (from, to) => (t) => value` - Custom interpolation function

**Returns:**
- `current: Signal<T>` - Readonly current animated value
- `target: WritableSignal<T>` - Writable target value

```typescript
// Basic tween
const { current, target } = tween(0, { 
  duration: 1000 
});

// With delay and easing
const animated = tween(0, { 
  duration: 1000,
  delay: 500,
  easing: (t) => t * (2 - t) // ease-out-quad
});

// Custom interpolation (e.g., for colors)
const color = tween(0, {
  duration: 1000,
  interpolate: (from, to) => (t) => {
    return Math.round(from + (to - from) * t);
  }
});
```

## State Management API

### usePrevious<T>(source: Signal<T>): Signal<T | undefined>

Track the previous value of a signal.

```typescript
const count = signal(0);
const previousCount = usePrevious(count);

console.log(previousCount()); // undefined
count.set(5);
console.log(previousCount()); // 0
count.set(10);
console.log(previousCount()); // 5
```

### useToggle(initial?: boolean): { value, toggle, setTrue, setFalse }

Boolean toggle with convenience methods.

**Returns:**
- `value: Signal<boolean>` - Current boolean state
- `toggle: () => void` - Toggle the state
- `setTrue: () => void` - Set to true
- `setFalse: () => void` - Set to false

```typescript
const toggle = useToggle(false);

console.log(toggle.value()); // false
toggle.toggle();
console.log(toggle.value()); // true
toggle.setFalse();
console.log(toggle.value()); // false
```

### useCounter(initial?, min?, max?): { count, increment, decrement, reset, set }

Counter with optional bounds.

**Parameters:**
- `initial?: number` - Initial count (default: 0)
- `min?: number` - Minimum value (default: -Infinity)
- `max?: number` - Maximum value (default: Infinity)

**Returns:**
- `count: Signal<number>` - Current count
- `increment: (step?) => void` - Increment by step (default: 1)
- `decrement: (step?) => void` - Decrement by step (default: 1)
- `reset: (value?) => void` - Reset to initial or specified value
- `set: (value) => void` - Set to specific value (clamped to bounds)

```typescript
const counter = useCounter(0, 0, 10);

counter.increment(); // 1
counter.increment(5); // 6
counter.increment(10); // 10 (clamped to max)
counter.decrement(3); // 7
counter.reset(); // 0
```

### useArray<T>(initial?): { items, push, pop, shift, unshift, filter, map, clear, remove, set, find, findIndex }

Array manipulation with immutable operations.

**Returns:**
- `items: Signal<T[]>` - Current array
- `push: (item: T) => void` - Add item to end
- `pop: () => void` - Remove last item
- `shift: () => void` - Remove first item
- `unshift: (item: T) => void` - Add item to start
- `filter: (fn) => void` - Filter array
- `map: (fn) => void` - Map array
- `clear: () => void` - Remove all items
- `remove: (index) => void` - Remove item at index
- `set: (items) => void` - Replace entire array
- `find: (fn) => T | undefined` - Find first matching item
- `findIndex: (fn) => number` - Find index of first match

```typescript
const list = useArray<string>(['apple', 'banana']);

list.push('cherry');
console.log(list.items()); // ['apple', 'banana', 'cherry']

list.remove(1);
console.log(list.items()); // ['apple', 'cherry']

list.filter((item) => item.startsWith('a'));
console.log(list.items()); // ['apple']
```

## Async Utilities API

### useDebounce<T>(source: Signal<T>, options): Signal<T>

Debounce signal value changes.

**Parameters:**
- `source: Signal<T>` - Source signal to debounce
- `options.delay: number` - Delay in milliseconds
- `options.leading?: boolean` - Execute on leading edge (default: false)
- `options.trailing?: boolean` - Execute on trailing edge (default: true)

```typescript
const searchInput = signal('');
const debouncedSearch = useDebounce(searchInput, { delay: 300 });

searchInput.set('hello');
// debouncedSearch updates after 300ms of no changes
```

### useThrottle<T>(source: Signal<T>, options): Signal<T>

Throttle signal update frequency.

**Parameters:**
- `source: Signal<T>` - Source signal to throttle
- `options.delay: number` - Delay in milliseconds
- `options.leading?: boolean` - Execute on leading edge (default: true)
- `options.trailing?: boolean` - Execute on trailing edge (default: false)

```typescript
const scrollY = signal(0);
const throttledScrollY = useThrottle(scrollY, { delay: 200 });

// throttledScrollY updates at most once per 200ms
window.addEventListener('scroll', () => {
  scrollY.set(window.scrollY);
});
```

## Timing Utilities API

### useInterval(callback, delay): { count, isActive, pause, resume, reset }

Interval timer with pause/resume/reset.

**Parameters:**
- `callback: () => void` - Function to execute
- `delay: number | Signal<number>` - Interval delay in milliseconds

**Returns:**
- `count: Signal<number>` - Number of times executed
- `isActive: Signal<boolean>` - Whether interval is running
- `pause: () => void` - Pause the interval
- `resume: () => void` - Resume the interval
- `reset: () => void` - Reset count and restart

```typescript
const interval = useInterval(() => {
  console.log('Tick!');
}, 1000);

console.log(interval.count()); // 0
// After 3 seconds...
console.log(interval.count()); // 3

interval.pause();
// Interval stops

interval.resume();
// Interval continues
```

### useTimeout(callback, delay): { isReady, isPending, cancel, reset }

Timeout with cancel/reset capabilities.

**Parameters:**
- `callback: () => void` - Function to execute
- `delay: number | Signal<number>` - Timeout delay in milliseconds

**Returns:**
- `isReady: Signal<boolean>` - Whether timeout has fired
- `isPending: Signal<boolean>` - Whether timeout is pending
- `cancel: () => void` - Cancel the timeout
- `reset: () => void` - Reset and restart the timeout

```typescript
const timeout = useTimeout(() => {
  console.log('Done!');
}, 3000);

console.log(timeout.isPending()); // true
console.log(timeout.isReady()); // false

// After 3 seconds...
console.log(timeout.isReady()); // true
```

### useNow(options?): Signal<Date>

Current timestamp signal with auto-updates.

**Parameters:**
- `options.interval?: number` - Update interval in milliseconds (default: 1000)

```typescript
const currentTime = useNow(); // Updates every second
const fastTime = useNow({ interval: 100 }); // Updates every 100ms

console.log(currentTime()); // Current Date object
```

## Browser APIs

### useMediaQuery(query: string | Signal<string>): Signal<boolean>

Reactive media query matching.

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

effect(() => {
  if (isMobile()) {
    console.log('Mobile view');
  }
});

// Reactive query
const breakpoint = signal('(max-width: 768px)');
const matches = useMediaQuery(breakpoint);
```

### useEventListener(target, event, handler, options?)

Event listener with automatic cleanup.

**Parameters:**
- `target: Window | Document | HTMLElement | Signal<HTMLElement | null>` - Event target
- `event: string` - Event name
- `handler: (event) => void` - Event handler
- `options?: AddEventListenerOptions` - Event listener options

```typescript
// Window event
useEventListener(window, 'resize', () => {
  console.log('Window resized');
});

// Element event
const button = signal<HTMLElement | null>(null);
useEventListener(button, 'click', (event) => {
  console.log('Button clicked');
});

// Reactive target
const element = signal(document.querySelector('.target'));
useEventListener(element, 'mousemove', handleMove);
```

### useLocalStorage<T>(key, initialValue): { value, remove }

Sync signal with localStorage.

**Returns:**
- `value: WritableSignal<T>` - Synced value signal
- `remove: () => void` - Remove from storage

```typescript
const theme = useLocalStorage('theme', 'light');

theme.value.set('dark'); // Persists to localStorage
console.log(theme.value()); // 'dark'

// Value persists across page reloads
theme.remove(); // Removes from localStorage
```

### useSessionStorage<T>(key, initialValue): { value, remove }

Sync signal with sessionStorage.

**Returns:**
- `value: WritableSignal<T>` - Synced value signal
- `remove: () => void` - Remove from storage

```typescript
const sessionData = useSessionStorage('data', { count: 0 });

sessionData.value.update(d => ({ count: d.count + 1 }));
// Persists for the session only
```

## Easing Functions

Common easing functions you can use:

```typescript
// Linear
(t) => t

// Ease-in-quad
(t) => t * t

// Ease-out-quad
(t) => t * (2 - t)

// Ease-in-out-quad
(t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

// Ease-in-cubic
(t) => t * t * t

// Ease-out-cubic
(t) => (--t) * t * t + 1
```

## Demo Application

Run the demo to see all features in action:

```bash
# Build the library
npm run build

# Start demo
npm start
```

Navigate to `http://localhost:4200/`

## Development

```bash
# Install dependencies
npm install

# Build library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
angular-signals/
├── projects/
│   ├── angular-signals/     # Library source
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── signal/       # deepSignal
│   │   │   │   ├── computed/     # deepComputed
│   │   │   │   └── animation/    # spring & tween
│   │   │   └── public-api.ts
│   │   └── package.json
│   └── demo/                # Demo application
└── .github/
    └── workflows/
        └── ci-cd.yml        # CI/CD pipeline
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Publishing

The library is automatically published to npm when a new release is created on GitHub:

1. Create a new release with a tag (e.g., `v1.0.0`)
2. CI/CD automatically builds, tests, and publishes to npm

### Manual Publishing

```bash
# Build the library
npm run build

# Navigate to dist folder
cd dist/angular-signals

# Publish to npm
npm publish --access public
```

## CI/CD

The project uses GitHub Actions for:
- ✅ Building on Node 18 and 20
- ✅ Running tests
- ✅ Linting and formatting checks
- ✅ Publishing to npm on releases
- ✅ Publishing to GitHub Package Registry

## Requirements

- Angular 20.3+
- Node.js 18+
- TypeScript 5.9+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Julio Burgos

## Acknowledgments

- Inspired by Svelte's motion primitives
- Built with Angular's new signal APIs
- Uses lodash for deep equality checking

---

Made with ❤️ using Angular Signals

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
