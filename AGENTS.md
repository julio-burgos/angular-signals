# AI Agent Guidelines

This document provides guidance for AI agents working with the Angular Signals library.

## Project Overview

**Angular Signals** is a TypeScript library that extends Angular's signals API with:
- Deep equality checking for signals and computed values
- Physics-based spring animations
- Time-based tween animations with easing and interpolation

## Architecture

### Library Structure

```
projects/angular-signals/src/
├── public-api.ts              # Public exports
└── lib/
    ├── signal/
    │   └── signal.ts          # deepSignal implementation
    ├── computed/
    │   └── computed.ts        # deepComputed implementation
    └── animation/
        ├── spring.ts          # Spring animation utility
        └── tween.ts           # Tween animation utility
```

### Key Components

1. **deepSignal** (`signal.ts`)
   - Uses `lodash-es.isEqual` for deep equality comparison
   - Wraps Angular's signal with custom equality function
   - Type: `<T>(value: T) => WritableSignal<T>`

2. **deepComputed** (`computed.ts`)
   - Computed values with deep equality checking
   - Type: `<T>(computation: () => T) => Signal<T>`

3. **spring** (`animation/spring.ts`)
   - Physics-based animation using `requestAnimationFrame`
   - Formula: `force = delta * stiffness - velocity * damping`
   - Returns: `{ current: Signal<T>, target: WritableSignal<T> }`
   - Supports both `number` and `number[]` types via function overloads

4. **tween** (`animation/tween.ts`)
   - Time-based animation with easing curves
   - Curried interpolation: `(from: T, to: T) => (t: number) => T`
   - Features: duration, delay, easing functions
   - Returns: `{ current: Signal<T>, target: WritableSignal<T> }`

## Testing Strategy

### Framework
- **Vitest 3.2.4** with globals enabled
- **zone.js** for Angular change detection
- **TestBed** for Angular component testing

### Critical Testing Patterns

```typescript
// Effect testing requires manual flushing
TestBed.tick(); // Call after setting signals

// Example from signal.spec.ts
it('should trigger effect when value changes', () => {
  const s = deepSignal({ count: 0 });
  let effectCount = 0;
  
  effect(() => {
    s();
    effectCount++;
  });
  
  TestBed.tick(); // Required!
  
  s.set({ count: 1 });
  TestBed.tick(); // Required after each change!
  
  expect(effectCount).toBe(2);
});
```

### Animation Testing
- Use `vi.useFakeTimers()` for deterministic timing
- Test physics convergence for spring
- Test easing curves for tween
- Verify cleanup on component destroy

## Development Workflow

### Building
```bash
npm run build -- angular-signals
# Output: dist/angular-signals/
```

### Testing
```bash
npm test                    # Run all tests
npm test -- spring.spec.ts  # Run specific test
```

### Demo Application
```bash
npm start  # Serves demo on http://localhost:4200
```

## Code Style

### TypeScript Patterns

1. **Function Overloads for Type Safety**
```typescript
export function spring(config: SpringConfig<number>): SpringReturn<number>;
export function spring(config: SpringConfig<number[]>): SpringReturn<number[]>;
export function spring(config: SpringConfig<any>): SpringReturn<any> {
  // Implementation
}
```

2. **Curried Functions**
```typescript
// Preferred for higher-order functions
type InterpolateFunction<T> = (from: T, to: T) => (t: number) => T;

// Usage
const interpolate = (from: number, to: number) => (t: number) => 
  from + (to - from) * t;
```

3. **Cleanup Pattern**
```typescript
let rafId: number | null = null;

effect(() => {
  const start = () => {
    rafId = requestAnimationFrame(tick);
  };
  
  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
});
```

## CI/CD Pipeline

### Workflow Triggers
- **Push to main**: Build + Test + Lint
- **Release created**: Build + Test + Lint + Publish

### Automated Publishing
1. Create GitHub release with tag (e.g., `v0.0.2`)
2. Workflow automatically:
   - Runs full test suite on Node 18.x and 20.x
   - Builds library
   - Updates package version
   - Publishes to npm registry
   - Publishes to GitHub Package Registry

### Required Secrets
- `NPM_TOKEN`: npm automation token
- `CODECOV_TOKEN`: (optional) for coverage reports

## Common Tasks for Agents

### Adding a New Utility Function

1. Create implementation in `projects/angular-signals/src/lib/[category]/[name].ts`
2. Create tests in `[name].spec.ts`
3. Export from `public-api.ts`
4. Update README.md with API documentation
5. Add example to demo app (`projects/demo/src/app/`)
6. Update CHANGELOG.md

### Fixing Type Errors

- Check function overloads match implementation
- Verify generic constraints are properly defined
- Ensure return types are explicitly typed
- Use `as const` for literal types when needed

### Debugging Animation Issues

- Verify `requestAnimationFrame` is properly cleaned up
- Check that signals are updated within Angular zone
- Test with `vi.useFakeTimers()` for reproducibility
- Ensure precision threshold is appropriate

### Adding Dependencies

```bash
# Add to library
npm install --save package-name

# Add to dev dependencies
npm install --save-dev package-name

# After adding, rebuild library
npm run build -- angular-signals
```

## Best Practices

### For Agents Working on This Project

1. **Always run tests after changes**: `npm test`
2. **Use TestBed.tick()** when testing effects
3. **Maintain function overloads** for number/array types
4. **Follow curried function pattern** for higher-order functions
5. **Clean up subscriptions** in effect cleanup functions
6. **Update all documentation** when changing APIs
7. **Add tests for new features** before implementing
8. **Check TypeScript strict mode** compliance

### Code Quality Checklist

- [ ] TypeScript strict mode passes
- [ ] All tests pass with coverage
- [ ] Function has comprehensive JSDoc
- [ ] Exported from public-api.ts
- [ ] Demo includes usage example
- [ ] README updated with API docs
- [ ] CHANGELOG updated with changes
- [ ] No console.log or debug code
- [ ] Effects properly cleaned up
- [ ] Type definitions exported

## Performance Considerations

### Animation Performance
- Use `requestAnimationFrame` for smooth 60fps
- Batch signal updates when possible
- Clean up animations on component destroy
- Consider using `untracked()` for read-only operations

### Signal Performance
- Avoid deep equality on very large objects
- Use regular signals for primitive values
- Consider memoization for expensive computations

## Troubleshooting

### "Effect not running" in tests
**Solution**: Call `TestBed.tick()` after signal changes

### Type errors with interpolation
**Solution**: Ensure curried syntax `(from, to) => (t) => value`

### Animation not smooth
**Solution**: Verify `requestAnimationFrame` loop is not blocked

### Build fails
**Solution**: Check `tsconfig.lib.json` and dependency versions

## Documentation Standards

### JSDoc Format
```typescript
/**
 * Creates a signal with deep equality checking.
 * 
 * @param value - Initial value for the signal
 * @returns A writable signal that uses deep equality comparison
 * 
 * @example
 * ```ts
 * const user = deepSignal({ name: 'John', age: 30 });
 * user.set({ name: 'John', age: 30 }); // No update (deep equal)
 * ```
 */
```

### README Sections
- Installation
- Quick Start
- API Reference (with types)
- Examples
- Contributing
- License

## Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Vitest Documentation](https://vitest.dev/)
- [Project README](./README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [CI/CD Documentation](./.github/CI_CD.md)
- [NPM Setup Guide](./.github/NPM_SETUP.md)

## Contact

For questions or issues, please:
1. Check existing [GitHub Issues](https://github.com/julio-burgos/angular-signals/issues)
2. Review [Contributing Guidelines](./CONTRIBUTING.md)
3. Create a new issue with the appropriate template

---

**Version**: 0.0.1  
**Last Updated**: October 11, 2025  
**Maintained by**: The Angular Signals Community
