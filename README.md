# Angular Signals

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library that extends Angular's signals API with additional utilities for reactive programming.

## ✨ Features

- **Deep Equality Signals** - Signals that use deep equality comparison instead of reference equality
- **Animation Utilities** - Physics-based spring animations and time-based tween animations with easing
- **State Management** - Counter, toggle, array, and previous value signals
- **Async Utilities** - Debounce and throttle signals
- **Timing Utilities** - Interval, timeout, and now signals
- **Browser APIs** - Media query, event listener, and storage signals

## 🚀 Installation

```bash
npm install @angular-signals/angular-signals
```

## 📖 Quick Start

```typescript
import { deepSignal, spring, useCounter } from '@angular-signals/angular-signals';

// Deep equality signal
const user = deepSignal({ name: 'John', age: 30 });

// Spring animation
const position = spring(0, { stiffness: 0.15, damping: 0.8 });
position.target.set(100);

// Counter with methods
const counter = useCounter(0);
counter.increment(); // count becomes 1
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
