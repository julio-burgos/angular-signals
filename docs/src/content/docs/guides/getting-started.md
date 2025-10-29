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
import { Component, signal, effect, computed } from '@angular/core';
import { deepSignal, reactive, useToggle, spring } from '@angular-signals/angular-signals';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <!-- Reactive Object Example -->
      <h2>User Profile</h2>
      <p>Name: {{ user.name() }}</p>
      <p>Age: {{ user.age() }}</p>
      <p>Email: {{ user.email() }}</p>
      <button (click)="updateUser()">Update User</button>
      <button (click)="user.reset()">Reset User</button>

      <!-- Deep Signal Example -->
      <h2>Counter: {{ counter() }}</h2>
      <button (click)="increment()">Increment</button>

      <!-- Toggle Example -->
      <h2>Toggle: {{ toggle.value() ? 'ON' : 'OFF' }}</h2>
      <button (click)="toggle.toggle()">Toggle</button>

      <!-- Spring Animation Example -->
      <h2>Spring Animation: {{ Math.round(spring.current()) }}</h2>
      <button (click)="animate()">Animate to 100</button>
    </div>
  `,
})
export class ExampleComponent {
  // Reactive object with fine-grained signals
  user = reactive({
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  });

  // Computed value based on reactive object
  userDisplay = computed(() => `${this.user.name()} (${this.user.age()})`);

  // Deep equality signal
  counter = deepSignal(0);

  // Toggle utility
  toggle = useToggle(false);

  // Spring animation
  spring = spring(0, { stiffness: 0.1, damping: 0.8 });

  constructor() {
    // React to individual property changes
    effect(() => {
      console.log('User name changed:', this.user.name());
    });

    // React to complete state changes
    effect(() => {
      console.log('User state:', this.user.state());
    });

    // React to counter changes
    effect(() => {
      console.log('Counter changed:', this.counter());
    });
  }

  updateUser() {
    // Update individual properties
    this.user.name.set('Jane Doe');
    this.user.age.update(age => age + 1);
    
    // Or update multiple properties at once
    // this.user.update({ name: 'Jane Doe', email: 'jane@example.com' });
  }

  increment() {
    this.counter.update(count => count + 1);
  }

  animate() {
    this.spring.target.set(100);
  }
}
```

## Key Concepts

### Reactive Objects

The `reactive` utility converts plain objects into fine-grained reactive signals where each property becomes an individual signal:

```ts
const state = reactive({
  count: 0,
  name: 'John',
  settings: { theme: 'dark' }
});

// Each property is a signal
state.count.set(5);        // Only count updates
state.name.set('Jane');    // Only name updates

// Access complete state
console.log(state.state()); // { count: 5, name: 'Jane', settings: { theme: 'dark' } }

// Batch updates
state.update({ count: 10, name: 'Bob' });

// Reset to initial values
state.reset();
```

### Deep Equality Signals

Unlike regular Angular signals that use reference equality, `deepSignal` uses deep equality comparison:

```ts
const user = deepSignal({ name: 'John', age: 30 });

// This won't trigger effects (same content)
user.set({ name: 'John', age: 30 });

// This will trigger effects (different content)
user.set({ name: 'Jane', age: 30 });
```

### Animation Utilities

Create smooth animations with physics-based springs or time-based tweens:

```ts
// Spring animation
const position = spring(0, { stiffness: 0.1, damping: 0.8 });
position.target.set(100); // Animate to 100

// Tween animation
const opacity = tween(0, { duration: 1000, easing: 'easeOut' });
opacity.target.set(1); // Animate to 1 over 1 second
```

## What's Next?

- Check out the [Signal Utilities](/reference/signal-utilities) for reactive and deep signals
- Explore [Animation Utilities](/reference/animation-utilities) for spring and tween animations
- Learn about [State Management](/reference/state-management) utilities
- Review [Browser APIs](/reference/browser-apis) for storage and media queries
