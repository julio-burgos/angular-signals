/*
 * Public API Surface of angular-signals
 */

// Signal utilities
export * from './lib/signal/signal';
export * from './lib/signal/reactive';
export * from './lib/computed/computed';
export * from './lib/linkedsignal/linkedsignal';

// Animation utilities
export * from './lib/animation/spring';
export * from './lib/animation/tween';
export * from './lib/animation/animation-frames';

// State management
export * from './lib/state/previous';
export * from './lib/state/toggle';
export * from './lib/state/counter';
export * from './lib/state/array';
export * from './lib/state/history';

// Async utilities
export * from './lib/async/debounce';
export * from './lib/async/throttle';

// Timing utilities
export * from './lib/timing/interval';
export * from './lib/timing/timeout';
export * from './lib/timing/now';

// Browser APIs
export * from './lib/browser/media-query';
export * from './lib/browser/event-listener';
export * from './lib/browser/storage';
export * from './lib/browser/document-visible';
export * from './lib/browser/idle';
export * from './lib/browser/click-outside';
export * from './lib/browser/pressed-keys';
export * from './lib/browser/geolocation';
export * from './lib/browser/is-mounted';

// Element utilities
export * from './lib/elements/observers';
export * from './lib/elements/active-element';
export * from './lib/elements/element-rect';
export * from './lib/elements/element-size';
export * from './lib/elements/focus-within';
export * from './lib/elements/in-viewport';

// Utility helpers
export * from './lib/utils/extract';
export * from './lib/utils/bool-attr';

// Watch utilities
export * from './lib/watch/watch';
