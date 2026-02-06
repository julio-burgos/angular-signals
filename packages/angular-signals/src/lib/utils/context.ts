import { inject, InjectionToken, Provider } from '@angular/core';

/**
 * Runed-inspired typed context helper built on Angular DI.
 *
 * You typically use `provide()` on an ancestor component/provider, and `get()`
 * (or `getOr()`) in descendants.
 */
export class Context<TContext> {
  readonly token: InjectionToken<TContext>;

  constructor(readonly name = 'Context') {
    this.token = new InjectionToken<TContext>(name);
  }

  /** Create an Angular provider for this context. */
  provide(value: TContext): Provider {
    return { provide: this.token, useValue: value };
  }

  /** Whether the context is available in the current injection tree. */
  exists(): boolean {
    return inject(this.token, { optional: true }) !== null;
  }

  /**
   * Get the context value.
   *
   * @throws If the context has not been provided by an ancestor injector.
   */
  get(): TContext {
    const value = inject(this.token, { optional: true });
    if (value === null) {
      throw new Error(
        `Missing provider for context "${this.name}". Add \`providers: [ctx.provide(...)]\` to an ancestor component/provider.`
      );
    }
    return value;
  }

  /**
   * Get the context value or fall back to a default.
   *
   * @param fallback - Returned if the context is not provided.
   */
  getOr<TFallback>(fallback: TFallback): TContext | TFallback {
    const value = inject(this.token, { optional: true });
    return value === null ? fallback : value;
  }
}

/**
 * Creates a typed “context” helper (Runed-inspired) built on Angular DI.
 *
 * This is a small wrapper around `InjectionToken` + `inject()` to make creating
 * and consuming scoped values ergonomic, similar to Svelte’s context pattern.
 *
 * @param description - Used for the underlying token name and error messages
 *
 * @example
 * ```ts
 * import { Component, signal } from '@angular/core';
 * import { createContext } from '@angular-signals/angular-signals';
 *
 * const ThemeContext = createContext<string>('Theme');
 *
 * @Component({
 *   // ...
 *   providers: [ThemeContext.provide('dark')],
 * })
 * export class Parent {}
 *
 * @Component({
 *   // ...
 * })
 * export class Child {
 *   theme = ThemeContext.get();
 * }
 * ```
 */
export function createContext<T>(description = 'Context'): Context<T> {
  return new Context<T>(description);
}
