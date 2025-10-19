# AI Agent Guidelines

This document provides guidance for AI agents working with the Angular Signals library.

## ⚠️ MANDATORY WORKFLOW FOR ALL CHANGES ⚠️

**CRITICAL**: When adding ANY new functionality to this library, you MUST complete ALL four steps:

### Required Steps for Every New Feature:

1. **✅ Update README.md**
   - Add feature to the appropriate category in the Features section
   - Add comprehensive API documentation with:
     - Function signature with TypeScript types
     - Parameters description
     - Return value description
     - Code examples showing usage
     - Follow the existing documentation format exactly

2. **✅ Update Documentation Site**
   - Add detailed documentation to the appropriate `.mdx` file in `docs/src/content/docs/reference/`
   - Include API reference, usage examples, and TypeScript types
   - Update navigation in `astro.config.mjs` if adding new sections
   - Follow the existing Starlight documentation format

3. **✅ Update Demo Application**
   - Add interactive example to `apps/demo/src/app/app.ts`
   - Add UI section to `apps/demo/src/app/app.html`
   - Include:
     - Visual display of current state
     - Interactive controls (buttons, inputs, etc.)
     - Real-time feedback showing the utility in action
     - Clear section title and description

4. **✅ Update CHANGELOG.md**
   - Add entry under "Unreleased" or appropriate version
   - Use format: `- Added: [utility name] - [brief description]`
   - Include breaking changes if applicable

### Verification Checklist

Before completing any feature implementation, verify:

- [ ] README.md updated with API docs and examples
- [ ] Documentation site updated with detailed API reference
- [ ] Demo app has interactive example
- [ ] Demo app example is visible at http://localhost:4200
- [ ] CHANGELOG.md has entry for the change
- [ ] All tests pass (`npm test`)
- [ ] Feature is exported from `public-api.ts`
- [ ] TypeScript types are properly defined

### Non-Compliance

**DO NOT** consider a feature complete unless ALL four documentation requirements are met. Incomplete documentation makes the library unusable for developers.

## Project Overview

**Angular Signals** is a TypeScript library that extends Angular's signals API with:
- Deep equality checking for signals and computed values
- Physics-based spring animations
- Time-based tween animations with easing and interpolation

## Architecture

### Project Structure

```
angular-signals/
├── packages/
│   └── angular-signals/        # Main library package
├── apps/
│   └── demo/                   # Interactive demo application
├── docs/                       # Documentation site (Astro + Starlight)
├── AGENTS.md                   # This file - AI agent guidelines
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT license
├── README.md                   # Main project README
├── nx.json                     # Nx workspace configuration
├── package.json                # Root package configuration
├── tsconfig.base.json          # Base TypeScript configuration
└── vitest.workspace.ts         # Vitest workspace configuration
```

### Documentation Site Structure

The `docs/` folder contains the documentation website built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/):

```
docs/
├── src/
│   ├── content/
│   │   ├── docs/
│   │   │   ├── index.mdx                    # Homepage
│   │   │   ├── guides/
│   │   │   │   └── getting-started.md      # Getting started guide
│   │   │   └── reference/                   # API reference docs
│   │   │       ├── signal-utilities.mdx    # Signal utilities
│   │   │       ├── animation-utilities.mdx # Animation utilities
│   │   │       ├── async-utilities.mdx     # Async utilities
│   │   │       ├── state-management.mdx    # State management
│   │   │       ├── browser-apis.mdx        # Browser APIs
│   │   │       └── timing-utilities.mdx    # Timing utilities
│   │   └── content.config.ts               # Content configuration
│   └── styles/
│       └── global.css                      # Global styles
├── astro.config.mjs                        # Astro configuration
├── package.json                            # Docs dependencies
└── wrangler.json                           # Cloudflare deployment config
```

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
- **zoneless** for Angular change detection
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

### Documentation Site
```bash
cd docs
npm run dev    # Serves docs on http://localhost:4321
npm run build  # Builds docs for production
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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

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

### Starlight Documentation Format
The documentation site uses [Starlight](https://starlight.astro.build/) with the following structure:

- **Homepage** (`index.mdx`): Overview and getting started
- **Guides** (`guides/`): Step-by-step tutorials and explanations
- **Reference** (`reference/`): API documentation organized by category

### Documentation Sections
- **signal-utilities.mdx**: `deepSignal`, `deepComputed`
- **animation-utilities.mdx**: `spring`, `tween`
- **async-utilities.mdx**: `useDebounce`, `useThrottle`
- **state-management.mdx**: `usePrevious`, `useToggle`, `useCounter`, `useArray`
- **browser-apis.mdx**: `useLocalStorage`, `useSessionStorage`, storage watchers
- **timing-utilities.mdx**: `useInterval`, `useTimeout`, `useNow`

### Documentation Requirements
Each utility must include:
- **Function signature** with TypeScript types
- **Parameters** description with types and defaults
- **Return value** description
- **Usage examples** with code snippets
- **Type definitions** where relevant

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
4. **Update README.md with API documentation** (See "MANDATORY WORKFLOW" above)
5. **Add example to demo app** (`projects/demo/src/app/`) (See "MANDATORY WORKFLOW" above)
6. **Update CHANGELOG.md** (See "MANDATORY WORKFLOW" above)
7. Run tests to verify: `npm test`
8. Test demo visually: `npm start` → http://localhost:4200

**REMINDER**: Follow the complete checklist in the "MANDATORY WORKFLOW FOR ALL CHANGES" section above.

### Fixing Type Errors

- Check function overloads match implementation
- Verify generic constraints are properly defined
- Ensure return types are explicitly typed
- Use `as const` for literal types when needed

### Debugging Animation Issues

- Verify `requestAnimationFrame` is properly cleaned up
- Check that signals are updated within Angular zone
- Test with `vi.useFakeTimers()` for reproducibility
- Ensure precision threshold is
