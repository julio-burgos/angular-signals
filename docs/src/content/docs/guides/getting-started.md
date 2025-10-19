---
title: Getting Started
description: Learn how to install and start using Angular Signals in your Angular project.
---

# Getting Started

Angular Signals is a TypeScript library that extends Angular's signals API with additional utilities for reactive programming.

## Installation

Install the Angular Signals package using npm:

```bash
npm install @angular-signals/angular-signals
```

Or using yarn:

```bash
yarn add @angular-signals/angular-signals
```

Or using pnpm:

```bash
pnpm add @angular-signals/angular-signals
```

## Requirements

- Angular 17.0.0 or higher
- TypeScript 5.0.0 or higher
- Node.js 18.0.0 or higher

## Basic Usage

Import the utilities you need and start using them in your Angular components:

```ts
import { Component, signal, effect } from '@angular/core';
import { deepSignal, useToggle, spring } from '@angular-signals/angular-signals';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h2>Counter: {{ counter() }}</h2>
      <button (click)="increment()">Increment</button>

      <h2>Toggle: {{ toggle.value() ? 'ON' : 'OFF' }}</h2>
      <button (click)="toggle.toggle()">Toggle</button>

      <h2>Spring Animation: {{ Math.round(spring.current()) }}</h2>
      <button (click)="animate()">Animate to 100</button>
    </div>
  `,
})
export class ExampleComponent {
  // Deep equality signal
  counter = deepSignal(0);

  // Toggle utility
  toggle = useToggle(false);

  // Spring animation
  spring = spring(0, { stiffness: 0.1, damping: 0.8 });

  constructor() {
    // React to counter changes
    effect(() => {
      console.log('Counter changed:', this.counter());
    });
  }

  increment() {
    this.counter.update(count => count + 1);
  }

  animate() {
    this.spring.target.set(100);
  }
}
```

## What's Next?

- Check out the [API Reference](/reference/api-reference) for detailed documentation of all utilities
- Read the [guides](/guides/) for advanced usage patterns
