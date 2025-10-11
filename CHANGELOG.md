# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] - TBD

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
