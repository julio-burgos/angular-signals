import { effect, signal, Signal, untracked } from '@angular/core';

export interface GeolocationOptions {
  /**
   * Auto-start watching (default: true).
   */
  immediate?: boolean;
  /**
   * Options passed to the Geolocation API.
   */
  positionOptions?: PositionOptions;
}

export interface GeolocationReturn {
  isSupported: boolean;
  isWatching: Signal<boolean>;
  coords: Signal<GeolocationCoordinates | null>;
  error: Signal<GeolocationPositionError | null>;
  start: () => void;
  stop: () => void;
}

/**
 * Watches the user's geolocation and exposes coordinates as signals.
 *
 * @param options - Optional configuration
 * @returns Object with geolocation signals and controls
 */
export function useGeolocation(options: GeolocationOptions = {}): GeolocationReturn {
  const isSupported =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

  const isWatching = signal(false);
  const coords = signal<GeolocationCoordinates | null>(null);
  const error = signal<GeolocationPositionError | null>(null);

  let watchId: number | null = null;

  const stop = () => {
    if (!isSupported) return;
    if (watchId === null) return;
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    isWatching.set(false);
  };

  const start = () => {
    if (!isSupported) return;
    if (watchId !== null) return;

    error.set(null);
    isWatching.set(true);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        untracked(() => coords.set(pos.coords));
      },
      (err) => {
        untracked(() => error.set(err));
      },
      options.positionOptions
    );
  };

  effect((onCleanup) => {
    if (!isSupported) return;
    if (options.immediate ?? true) start();
    onCleanup(() => stop());
  });

  return {
    isSupported,
    isWatching: isWatching.asReadonly(),
    coords: coords.asReadonly(),
    error: error.asReadonly(),
    start,
    stop,
  };
}

