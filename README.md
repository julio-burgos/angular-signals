# Angular Signals

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library that extends Angular's signals API with additional utilities for reactive programming.

## ✨ Features

- **Deep Equality Signals** - Signals that use deep equality comparison instead of reference equality
- **Reactive Objects** - Convert plain objects into fine-grained reactive signals for each property
- **Animation Utilities** - Physics-based spring animations and time-based tween animations with easing
- **State Management** - Counter, toggle, array, previous value, and state history utilities
- **Async Utilities** - Debounce and throttle signals
- **Timing Utilities** - Interval, timeout, and now signals
- **Browser APIs** - Media query, event listener, storage, visibility, idle, and input utilities
- **Element Utilities** - Element size/rect, focus-within, viewport detection, and observer helpers
- **Utility Helpers** - `extract` and `boolAttr`

## 🚀 Installation

```bash
npm install @angular-signals/angular-signals
```

## 📖 Quick Start

```typescript
import { deepSignal, reactive, spring, useCounter } from '@angular-signals/angular-signals';

// Deep equality signal
const user = deepSignal({ name: 'John', age: 30 });

// Reactive object with fine-grained signals
const state = reactive({ count: 0, name: 'John' });
state.count.set(5); // Only count signal updates
state.name.set('Jane'); // Only name signal updates

// Spring animation
const position = spring(0, { stiffness: 0.15, damping: 0.8 });
position.target.set(100);

// Counter with methods
const counter = useCounter(0);
counter.increment(); // count becomes 1
```

## 🧭 State History

#### `useStateHistory<T>(state: WritableSignal<T>, options?: StateHistoryOptions<T>): StateHistoryReturn<T>`

Track a signal over time and navigate changes with undo/redo.

**Parameters:**
- `state: WritableSignal<T>` - The writable signal to track
- `options?: StateHistoryOptions<T>` - Optional configuration (`maxSize`, `clone`, `timestamp`)

**Returns:** `StateHistoryReturn<T>` - `{ log, index, canUndo, canRedo, undo, redo, clear }`

**Example:**
```ts
import { signal } from '@angular/core';
import { useStateHistory } from '@angular-signals/angular-signals';

const count = signal(0);
const history = useStateHistory(count);

count.set(1);
count.set(2);

history.undo(); // count -> 1
history.redo(); // count -> 2
```

## 🌐 Browser + Element Utilities

#### `useIdle(options?: IdleOptions): IdleReturn`

Track whether the user is idle.

**Parameters:**
- `options?: IdleOptions` - `{ timeout, events, detectVisibilityChanges, initialState }`

**Returns:** `IdleReturn` - `{ idle, lastActive, reset, stop }`

**Example:**
```ts
import { useIdle } from '@angular-signals/angular-signals';

const { idle } = useIdle({ timeout: 30_000 });
```

#### `onClickOutside(target, handler, options?): ClickOutsideReturn`

Run a callback when a pointer/mouse event happens outside an element.

**Example:**
```ts
import { signal } from '@angular/core';
import { onClickOutside } from '@angular-signals/angular-signals';

const box = signal<HTMLElement | null>(null);
onClickOutside(box, () => console.log('outside'), { events: ['mousedown'] });
```

## 🎮 Demo

Try the interactive demo to see all utilities in action:

```bash
npm start
```

Then open [http://localhost:4200](http://localhost:4200) in your browser.

## 📚 Documentation

- [Full API Reference](./packages/angular-signals/README.md)
- [Documentation Site](https://angular-signals.dev) (coming soon)

## 🏗️ Project Structure

This is a monorepo containing:

- `packages/angular-signals/` - Main library package
- `apps/demo/` - Interactive demo application
- `docs/` - Documentation site (Astro + Starlight)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.
