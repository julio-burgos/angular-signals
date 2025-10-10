# Angular Signals Library Demo

This demo application showcases all the functions exported from the `angular-signals` library.

## Running the Demo

1. **Build the library first:**
   ```bash
   ng build angular-signals
   ```

2. **Start the demo application:**
   ```bash
   ng serve demo
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4200/`

## Features Demonstrated

### 1. 🔵 DeepSignal
- Creates signals with **deep equality checking** using lodash's `isEqual`
- Only triggers updates when nested values actually change
- Try modifying the name, age, or city - effects only run on real changes

**Example:**
```typescript
const userProfile = deepSignal({
  name: 'John Doe',
  age: 30,
  address: {
    city: 'New York',
    country: 'USA',
  },
});
```

### 2. ⚡ DeepComputed
- Creates computed signals with **deep equality checking**
- Derived values only update when they're deeply different
- The summary automatically updates when the profile changes

**Example:**
```typescript
const userSummary = deepComputed(() => {
  const profile = userProfile();
  return {
    displayName: `${profile.name} (${profile.age})`,
    location: `${profile.address.city}, ${profile.address.country}`,
  };
});
```

### 3. 🌀 Spring Animation
- **Physics-based animations** with stiffness and damping parameters
- Natural-feeling motion that settles gradually
- Works with both single values and arrays (2D/3D positions)

**Features:**
- Configurable stiffness (how quickly spring responds)
- Configurable damping (how much motion is dampened)
- Settles naturally at target value

**Example:**
```typescript
const { current, target } = spring(0, { 
  stiffness: 0.15, 
  damping: 0.8 
});

// Animate to a new value
target.set(100);

// Read the current animated value
console.log(current());
```

### 4. ⏱️ Tween Animation
- **Time-based animations** with precise duration control
- Support for delay before animation starts
- Custom easing functions for different motion styles
- Custom interpolation functions for complex values

**Features:**
- Duration in milliseconds
- Optional delay before starting
- Easing functions (linear, ease-in, ease-out, etc.)
- Custom interpolation (great for colors, angles, etc.)

**Example:**
```typescript
const { current, target } = tween(0, { 
  duration: 1000,
  delay: 500,
  easing: (t) => t * (2 - t) // ease-out-quad
});

// Animate to a new value
target.set(100);
```

## Interactive Elements

### DeepSignal Demo
- Input fields to modify user profile data
- Watch effects fire in the console
- See JSON representation update in real-time

### Spring Animation Demo
- Buttons to set different target values (0, 50, 100, 200)
- Visual progress bar showing spring animation
- 2D canvas with animated ball using spring physics
- Reset button to return all springs to origin

### Tween Animation Demo
- Buttons to set different target values
- Basic tween with 1-second duration
- Delayed tween with 500ms delay
- 2D position tween with custom easing
- Visual progress bars for each tween

## Console Output

Open your browser's console to see:
- User profile changes logged
- User summary computations logged
- Spring value changes logged
- Real-time reactive updates

## Library API

All functions are exported from `angular-signals`:

```typescript
import { deepSignal, deepComputed, spring, tween } from 'angular-signals';
```

### deepSignal<T>(value: T): WritableSignal<T>
Creates a signal with deep equality checking.

### deepComputed<T>(computation: () => T): Signal<T>
Creates a computed signal with deep equality checking.

### spring(initialValue, config): { current, target }
Creates a physics-based spring animation.

### tween(initialValue, options): { current, target }
Creates a time-based tween animation.

## Project Structure

```
projects/
  angular-signals/        # Library source
    src/
      lib/
        signal/          # deepSignal
        computed/        # deepComputed
        animation/
          spring.ts      # Spring animations
          tween.ts       # Tween animations
      public-api.ts      # Public exports
  
  demo/                  # Demo application
    src/
      app/
        app.ts           # Demo component
        app.html         # Demo template
        app.css          # Demo styles
```

## Building for Production

To build both the library and demo:

```bash
# Build library
ng build angular-signals

# Build demo (after library is built)
ng build demo
```

## Learn More

- Check the test files for more usage examples
- See the source code in `projects/angular-signals/src/lib/`
- Experiment with different animation parameters in the demo!
