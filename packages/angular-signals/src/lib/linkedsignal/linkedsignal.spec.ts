import { effect, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { deepLinkedSignal } from "./linkedsignal";
import { expect, it, describe, vi, beforeEach, afterEach } from 'vitest';

describe('deepLinkedSignal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create a linked signal with deep equality check using computation only', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const counter = signal(1);
      const linked = deepLinkedSignal(() => ({ value: counter(), doubled: counter() * 2 }));

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ value: 1, doubled: 2 });

      // Update counter - should trigger effect with new computed value
      counter.set(2);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ value: 2, doubled: 4 });

      // Set counter to produce deep equal result - should NOT trigger effect
      const currentValue = linked();
      counter.set(2); // same value, should produce same result
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2); // No new call
    });
  });

  it('should create a linked signal with source and computation', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal(1);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: number) => ({ value: sourceValue, doubled: sourceValue * 2 })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ value: 1, doubled: 2 });

      // Update source - should trigger effect with new computed value
      source.set(2);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ value: 2, doubled: 4 });
    });
  });

  it('should not trigger effect when computation returns deep equal value', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal({ id: 1 });
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: { id: number }) => ({ data: { id: sourceValue.id } })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ data: { id: 1 } });

      // Set source to different object but computation returns deep equal value
      // Should NOT trigger effect due to deep equality
      source.set({ id: 1 });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);

      // Set source to different value that produces different computation result
      source.set({ id: 2 });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ data: { id: 2 } });
    });
  });

  it('should allow direct updates to linked signal', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal(10);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: number) => ({ count: sourceValue })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ count: 10 });

      // Directly update the linked signal - should trigger effect
      linked.set({ count: 20 });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ count: 20 });

      // Set to same value with deep equality - should NOT trigger effect
      linked.set({ count: 20 });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
    });
  });

  it('should work with nested objects and arrays', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal([1, 2, 3]);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: number[]) => ({
          items: sourceValue,
          metadata: { count: sourceValue.length }
        })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({
        items: [1, 2, 3],
        metadata: { count: 3 }
      });

      // Update source with deep equal array - should NOT trigger effect
      source.set([1, 2, 3]);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);

      // Update source with different array - SHOULD trigger effect
      source.set([1, 2, 3, 4]);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({
        items: [1, 2, 3, 4],
        metadata: { count: 4 }
      });
    });
  });

  it('should handle primitive values', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal('hello');
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: string) => sourceValue.toUpperCase()
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith('HELLO');

      // Update source - should trigger effect
      source.set('world');
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith('WORLD');
    });
  });

  it('should support update method with deep equality', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal(5);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: number) => ({ value: sourceValue })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ value: 5 });

      // Update using update method
      linked.update((prev: { value: number }) => ({ value: prev.value + 10 }));
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ value: 15 });

      // Update to deep equal value - should NOT trigger effect
      linked.update((prev: { value: number }) => ({ value: prev.value }));
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
    });
  });

  it('should handle complex nested structures', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal({ user: { name: 'John', age: 30 } });
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: { user: { name: string; age: number } }) => ({
          profile: {
            ...sourceValue.user,
            displayName: `${sourceValue.user.name} (${sourceValue.user.age})`
          }
        })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({
        profile: { name: 'John', age: 30, displayName: 'John (30)' }
      });

      // Update source with deep equal value - should NOT trigger effect
      source.set({ user: { name: 'John', age: 30 } });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);

      // Update source with different nested value - SHOULD trigger effect
      source.set({ user: { name: 'Jane', age: 25 } });
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({
        profile: { name: 'Jane', age: 25, displayName: 'Jane (25)' }
      });
    });
  });

  it('should work with arrays of objects', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      type Item = { id: number; name: string };
      const source = signal<Item[]>([{ id: 1, name: 'Item 1' }]);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue: Item[]) => ({
          items: sourceValue.map(item => ({ ...item, label: `#${item.id}: ${item.name}` }))
        })
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({
        items: [{ id: 1, name: 'Item 1', label: '#1: Item 1' }]
      });

      // Add new item - SHOULD trigger effect
      source.set([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({
        items: [
          { id: 1, name: 'Item 1', label: '#1: Item 1' },
          { id: 2, name: 'Item 2', label: '#2: Item 2' }
        ]
      });
    });
  });

  it('should access previous value in computation', () => {
    TestBed.runInInjectionContext(() => {
      const effectSpy = vi.fn();
      const source = signal(1);
      const linked = deepLinkedSignal({
        source: () => source(),
        computation: (sourceValue, previous?) => {
          return {
            current: sourceValue,
            previous: previous?.value ?? 0,
            delta: sourceValue - (previous?.source ?? 0)
          };
        }
      });

      effect(() => {
        effectSpy(linked());
      });

      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(1);
      expect(effectSpy).toBeCalledWith({ current: 1, previous: 0, delta: 1 });

      // Update source
      source.set(5);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(2);
      expect(effectSpy).toBeCalledWith({ current: 5, previous: 1, delta: 4 });

      // Update source again
      source.set(3);
      TestBed.tick();
      expect(effectSpy).toBeCalledTimes(3);
      expect(effectSpy).toBeCalledWith({ current: 3, previous: 5, delta: -2 });
    });
  });
});
