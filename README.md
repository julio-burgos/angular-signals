# Angular Signals

[![CI/CD](https://github.com/yourusername/angular-signals/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yourusername/angular-signals/actions/workflows/ci-cd.yml)
[![npm version](https://badge.fury.io/js/angular-signals.svg)](https://www.npmjs.com/package/angular-signals)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced Angular signals library with deep equality checking and physics-based animations.

## Features

- 🔵 **deepSignal** - Signals with deep equality checking using lodash
- ⚡ **deepComputed** - Computed signals with deep equality comparison
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
