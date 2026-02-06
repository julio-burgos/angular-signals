import { effect, signal, Signal, untracked } from '@angular/core';

export interface SearchParamsOptions {
  /**
   * Update the URL via pushState or replaceState (default: 'replace').
   */
  mode?: 'push' | 'replace';
  /**
   * If true, include the hash when updating URL (default: true).
   */
  preserveHash?: boolean;
}

export interface SearchParamsReturn {
  params: Signal<URLSearchParams>;
  get: (key: string) => string | null;
  set: (key: string, value: string | null) => void;
  setMany: (entries: Record<string, string | null | undefined>) => void;
  remove: (key: string) => void;
  replaceAll: (params: URLSearchParams) => void;
}

function readParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/**
 * Reactive URL search params helper (browser-only).
 *
 * @param options - Optional configuration
 * @returns Signals and helpers for reading/writing `window.location.search`
 */
export function useSearchParams(options: SearchParamsOptions = {}): SearchParamsReturn {
  const { mode = 'replace', preserveHash = true } = options;

  const params = signal<URLSearchParams>(readParams());

  const write = (next: URLSearchParams) => {
    if (typeof window === 'undefined') return;
    const search = next.toString();
    const nextUrl =
      window.location.pathname +
      (search ? `?${search}` : '') +
      (preserveHash ? window.location.hash : '');

    if (mode === 'push') {
      window.history.pushState({}, '', nextUrl);
    } else {
      window.history.replaceState({}, '', nextUrl);
    }

    untracked(() => params.set(new URLSearchParams(window.location.search)));
  };

  effect((onCleanup) => {
    if (typeof window === 'undefined') return;

    const onPop = () => params.set(readParams());
    window.addEventListener('popstate', onPop);
    onCleanup(() => window.removeEventListener('popstate', onPop));
  });

  return {
    params: params.asReadonly(),
    get: (key) => params().get(key),
    set: (key, value) => {
      const next = new URLSearchParams(params());
      if (value == null) next.delete(key);
      else next.set(key, value);
      write(next);
    },
    setMany: (entries) => {
      const next = new URLSearchParams(params());
      for (const [k, v] of Object.entries(entries)) {
        if (v == null) next.delete(k);
        else next.set(k, String(v));
      }
      write(next);
    },
    remove: (key) => {
      const next = new URLSearchParams(params());
      next.delete(key);
      write(next);
    },
    replaceAll: (p) => write(new URLSearchParams(p)),
  };
}

