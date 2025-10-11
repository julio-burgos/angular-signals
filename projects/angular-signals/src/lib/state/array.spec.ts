import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { effect, provideZonelessChangeDetection } from '@angular/core';
import { useArray } from './array';

describe('useArray', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should initialize with empty array by default', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray<number>();
      expect(arr.items()).toEqual([]);
    });
  });

  it('should initialize with provided array', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);
      expect(arr.items()).toEqual([1, 2, 3]);
    });
  });

  it('should push items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2]);

      arr.push(3);
      expect(arr.items()).toEqual([1, 2, 3]);

      arr.push(4, 5);
      expect(arr.items()).toEqual([1, 2, 3, 4, 5]);
    });
  });

  it('should pop items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);

      const popped = arr.pop();
      expect(popped).toBe(3);
      expect(arr.items()).toEqual([1, 2]);

      arr.pop();
      expect(arr.items()).toEqual([1]);
    });
  });

  it('should return undefined when popping empty array', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray<number>();
      const popped = arr.pop();
      expect(popped).toBeUndefined();
      expect(arr.items()).toEqual([]);
    });
  });

  it('should shift items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);

      const shifted = arr.shift();
      expect(shifted).toBe(1);
      expect(arr.items()).toEqual([2, 3]);
    });
  });

  it('should return undefined when shifting empty array', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray<number>();
      const shifted = arr.shift();
      expect(shifted).toBeUndefined();
    });
  });

  it('should unshift items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([2, 3]);

      arr.unshift(1);
      expect(arr.items()).toEqual([1, 2, 3]);

      arr.unshift(-1, 0);
      expect(arr.items()).toEqual([-1, 0, 1, 2, 3]);
    });
  });

  it('should filter items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3, 4, 5]);

      arr.filter(x => x % 2 === 0);
      expect(arr.items()).toEqual([2, 4]);
    });
  });

  it('should map items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);

      arr.map(x => x * 2);
      expect(arr.items()).toEqual([2, 4, 6]);
    });
  });

  it('should clear items', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);

      arr.clear();
      expect(arr.items()).toEqual([]);
    });
  });

  it('should remove item by index', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3, 4]);

      arr.remove(1);
      expect(arr.items()).toEqual([1, 3, 4]);

      arr.remove(0);
      expect(arr.items()).toEqual([3, 4]);
    });
  });

  it('should set entire array', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);

      arr.set([4, 5, 6]);
      expect(arr.items()).toEqual([4, 5, 6]);
    });
  });

  it('should work with objects', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);

      arr.push({ id: 3, name: 'Charlie' });
      expect(arr.items().length).toBe(3);

      const found = arr.find((item: any) => item.id === 2);
      expect(found).toEqual({ id: 2, name: 'Bob' });
    });
  });

  it('should find index', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([10, 20, 30, 40]);

      const index = arr.findIndex(x => x === 30);
      expect(index).toBe(2);

      const notFound = arr.findIndex(x => x === 100);
      expect(notFound).toBe(-1);
    });
  });

  it('should trigger effect on change', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2]);
      let effectCount = 0;
      let lastLength = 0;

      effect(() => {
        lastLength = arr.items().length;
        effectCount++;
      });

      TestBed.flushEffects();
      expect(effectCount).toBe(1);
      expect(lastLength).toBe(2);

      arr.push(3);
      TestBed.flushEffects();
      expect(effectCount).toBe(2);
      expect(lastLength).toBe(3);

      arr.clear();
      TestBed.flushEffects();
      expect(effectCount).toBe(3);
      expect(lastLength).toBe(0);
    });
  });

  it('should maintain immutability', () => {
    TestBed.runInInjectionContext(() => {
      const arr = useArray([1, 2, 3]);
      const original = arr.items();

      arr.push(4);

      expect(arr.items()).not.toBe(original);
      expect(original).toEqual([1, 2, 3]);
      expect(arr.items()).toEqual([1, 2, 3, 4]);
    });
  });
});
