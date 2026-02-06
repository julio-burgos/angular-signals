# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Signal Utilities:**
  - `reactive` - Convert plain objects into fine-grained reactive signals for each property
- Added: useStateHistory - Track signal changes with a timestamped history log and undo/redo controls
- Added: useDocumentVisible - Signal for Page Visibility API
- Added: useIdle - Idle detection with activity events and timeout
- Added: onClickOutside - Outside-click detection with cleanup
- Added: usePressedKeys - Track currently pressed keyboard keys
- Added: useGeolocation - Geolocation watcher signals with start/stop
- Added: useIsMounted - Signal that flips false on destroy
- Added: useActiveElement - Track `document.activeElement` reactively
- Added: useElementRect - Reactive bounding client rect tracking
- Added: useElementSize - Reactive element width/height tracking
- Added: useFocusWithin - Track focus-within for an element
- Added: useInViewport - IntersectionObserver-based viewport detection
- Added: useResizeObserver - ResizeObserver helper with cleanup
- Added: useMutationObserver - MutationObserver helper with cleanup
- Added: useIntersectionObserver - IntersectionObserver helper with cleanup
- Added: useAnimationFrames - requestAnimationFrame loop with timing signals
- Added: extract - Resolve direct values or getters/signals
- Added: boolAttr - Parse boolean-attribute-like values
- Added: createContext - Runed-inspired typed context helper built on Angular DI
- Added: useSearchParams - Reactive URL query string helpers

### Changed
- **Browser Storage:** `useSessionStorage` and `watchSessionStorageKey` no longer synchronize across browser tabs since sessionStorage is unique to each tab/window

### Added
- **State Management Utilities:**
  - `usePrevious` - Track previous signal value
  - `useToggle` - Boolean toggle with convenience methods
  - `useCounter` - Counter with bounds and operations
  - `useArray` - Array manipulation with immutable operations

- **Async Utilities:**
  - `useDebounce` - Debounce signal value changes
  - `useThrottle` - Throttle signal update frequency

- **Timing Utilities:**
  - `useInterval` - Interval timer with pause/resume/reset
  - `useTimeout` - Timeout with cancel/reset capabilities
  - `useNow` - Current timestamp signal with auto-updates

- **Browser APIs:**
  - `useMediaQuery` - Reactive media query matching
  - `useEventListener` - Event listener with automatic cleanup
  - `useLocalStorage` - Sync signal with localStorage
  - `useSessionStorage` - Sync signal with sessionStorage

- **Browser API Utilities:**
  - `watchStorageKey` - Watch specific storage keys for changes from other tabs/windows
  - `watchLocalStorageKey` - Watch localStorage keys with Angular signals
  - `watchSessionStorageKey` - Watch sessionStorage keys with Angular signals

- **Documentation:**
  - Comprehensive API documentation for all utilities
  - Interactive demo application showcasing all features
  - AI Agent Guidelines (AGENTS.md) with mandatory workflow for future development

### Changed
- Enhanced demo application with 16+ interactive examples
- Updated test suite to 117 tests with 100% passing rate
- Improved TypeScript type definitions across all utilities

## [0.0.2] - 2025-10-11

### Added
- Spring animation function with physics-based motion
- Tween animation function with time-based interpolation
- Support for delay in tween animations
- Custom easing functions for tweens
- Custom interpolation functions for tweens (curried)
- Comprehensive test suite for all functions
- Demo application showcasing all features
- CI/CD pipeline with GitHub Actions
- Automatic npm publishing on releases

### Changed
- Updated deepSignal to use lodash-es for tree-shaking
- Improved TypeScript types with function overloads
- Enhanced documentation with examples

### Fixed
- Type safety for nested object updates
- Effect execution timing in animations

## [0.0.1] - 2025-10-10

### Added
- Initial release
- `deepSignal` - Signals with deep equality checking
- `deepComputed` - Computed signals with deep equality
- Basic test suite
- Project structure and build configuration

### Dependencies
- Angular 20.3+
- lodash-es for deep equality checking
- TypeScript 5.9+

[Unreleased]: https://github.com/yourusername/angular-signals/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/yourusername/angular-signals/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/yourusername/angular-signals/releases/tag/v0.0.1
