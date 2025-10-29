import { TestBed } from '@angular/core/testing';
import { effect } from '@angular/core';
import { reactive } from './reactive';

describe('reactive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should create signals for each property', () => {
    const obj = reactive({
      name: 'John',
      age: 30,
      active: true,
    });

    expect(obj.name()).toBe('John');
    expect(obj.age()).toBe(30);
    expect(obj.active()).toBe(true);
  });

  it('should allow updating individual properties', () => {
    const obj = reactive({
      count: 0,
      label: 'Counter',
    });

    obj.count.set(5);
    obj.label.set('New Counter');

    expect(obj.count()).toBe(5);
    expect(obj.label()).toBe('New Counter');
  });

  it('should allow updating properties with update method', () => {
    const obj = reactive({
      count: 0,
      label: 'Counter',
    });

    obj.count.update((c) => c + 1);
    obj.label.update((l) => l + ' Updated');

    expect(obj.count()).toBe(1);
    expect(obj.label()).toBe('Counter Updated');
  });

  it('should provide state computed signal', () => {
    const obj = reactive({
      name: 'John',
      age: 30,
    });

    const state = obj.state();
    expect(state).toEqual({ name: 'John', age: 30 });

    obj.name.set('Jane');
    obj.age.set(25);

    const newState = obj.state();
    expect(newState).toEqual({ name: 'Jane', age: 25 });
  });

  it('should update multiple properties with update method', () => {
    const obj = reactive({
      name: 'John',
      age: 30,
      email: 'john@example.com',
    });

    obj.update({ name: 'Jane', age: 25 });

    expect(obj.name()).toBe('Jane');
    expect(obj.age()).toBe(25);
    expect(obj.email()).toBe('john@example.com'); // unchanged
  });

  it('should reset all properties to initial values', () => {
    const obj = reactive({
      count: 0,
      label: 'Initial',
      active: false,
    });

    // Change values
    obj.count.set(10);
    obj.label.set('Modified');
    obj.active.set(true);

    expect(obj.count()).toBe(10);
    expect(obj.label()).toBe('Modified');
    expect(obj.active()).toBe(true);

    // Reset
    obj.reset();

    expect(obj.count()).toBe(0);
    expect(obj.label()).toBe('Initial');
    expect(obj.active()).toBe(false);
  });

  it('should trigger effects when individual properties change', () => {
    TestBed.runInInjectionContext(() => {
      const obj = reactive({
        name: 'John',
        age: 30,
      });

      let nameEffectCount = 0;
      let ageEffectCount = 0;

      effect(() => {
        obj.name();
        nameEffectCount++;
      });

      effect(() => {
        obj.age();
        ageEffectCount++;
      });

      TestBed.tick(); // Initial effect runs

      expect(nameEffectCount).toBe(1);
      expect(ageEffectCount).toBe(1);

      obj.name.set('Jane');
      TestBed.tick();

      expect(nameEffectCount).toBe(2);
      expect(ageEffectCount).toBe(1); // Should not trigger

      obj.age.set(25);
      TestBed.tick();

      expect(nameEffectCount).toBe(2); // Should not trigger
      expect(ageEffectCount).toBe(2);
    });
  });

  it('should trigger effect when state changes', () => {
    TestBed.runInInjectionContext(() => {
      const obj = reactive({
        count: 0,
        label: 'Counter',
      });

      let stateEffectCount = 0;
      let lastState: unknown;

      effect(() => {
        lastState = obj.state();
        stateEffectCount++;
      });

      TestBed.tick();

      expect(stateEffectCount).toBe(1);
      expect(lastState).toEqual({ count: 0, label: 'Counter' });

      obj.count.set(5);
      TestBed.tick();

      expect(stateEffectCount).toBe(2);
      expect(lastState).toEqual({ count: 5, label: 'Counter' });

      obj.update({ count: 10, label: 'New Counter' });
      TestBed.tick();

      expect(stateEffectCount).toBe(3);
      expect(lastState).toEqual({ count: 10, label: 'New Counter' });
    });
  });

  it('should work with complex objects', () => {
    interface User {
      profile: {
        name: string;
        avatar: string;
      };
      settings: {
        theme: string;
        notifications: boolean;
      };
      stats: number[];
    }

    const user = reactive<User>({
      profile: { name: 'John', avatar: 'avatar.jpg' },
      settings: { theme: 'dark', notifications: true },
      stats: [1, 2, 3],
    });

    expect(user.profile()).toEqual({ name: 'John', avatar: 'avatar.jpg' });
    expect(user.settings()).toEqual({ theme: 'dark', notifications: true });
    expect(user.stats()).toEqual([1, 2, 3]);

    user.profile.set({ name: 'Jane', avatar: 'jane.jpg' });
    user.stats.set([4, 5, 6]);

    expect(user.profile()).toEqual({ name: 'Jane', avatar: 'jane.jpg' });
    expect(user.stats()).toEqual([4, 5, 6]);
    expect(user.settings()).toEqual({ theme: 'dark', notifications: true }); // unchanged
  });

  it('should handle empty objects', () => {
    const obj = reactive({});

    expect(obj.state()).toEqual({});

    obj.update({});
    obj.reset();

    expect(obj.state()).toEqual({});
  });

  it('should ignore undefined values in update', () => {
    const obj = reactive({
      name: 'John',
      age: 30,
    });

    obj.update({ name: 'Jane', age: undefined });

    expect(obj.name()).toBe('Jane');
    expect(obj.age()).toBe(30); // Should remain unchanged
  });

  it('should work with different primitive types', () => {
    const obj = reactive({
      stringValue: 'hello',
      numberValue: 42,
      booleanValue: true,
      nullValue: null,
      undefinedValue: undefined,
    });

    expect(obj.stringValue()).toBe('hello');
    expect(obj.numberValue()).toBe(42);
    expect(obj.booleanValue()).toBe(true);
    expect(obj.nullValue()).toBe(null);
    expect(obj.undefinedValue()).toBe(undefined);

    obj.stringValue.set('world');
    obj.numberValue.set(100);
    obj.booleanValue.set(false);
    obj.nullValue.set('not null');
    obj.undefinedValue.set('defined');

    expect(obj.stringValue()).toBe('world');
    expect(obj.numberValue()).toBe(100);
    expect(obj.booleanValue()).toBe(false);
    expect(obj.nullValue()).toBe('not null');
    expect(obj.undefinedValue()).toBe('defined');
  });

  it('should maintain referential integrity for state', () => {
    const obj = reactive({
      count: 0,
    });

    const state1 = obj.state();
    const state2 = obj.state();

    // Should return same reference when no changes
    expect(state1).toBe(state2);

    obj.count.set(1);

    const state3 = obj.state();
    // Should return new reference after change
    expect(state1).not.toBe(state3);
  });

  it('should only update properties that exist in the original object', () => {
    const obj = reactive({
      name: 'John',
      age: 30,
    });

    // TypeScript should prevent this, but test runtime behavior
    (obj.update as unknown as (arg: unknown) => void)({
      name: 'Jane',
      nonExistent: 'value',
    });

    expect(obj.name()).toBe('Jane');
    expect(
      (obj as unknown as { nonExistent?: unknown }).nonExistent
    ).toBeUndefined();
  });

  it('should preserve deep equality for object references', () => {
    const obj = reactive({
      data: { nested: 'value' },
    });

    const originalData = obj.data();
    obj.data.set({ nested: 'value' }); // Same content, different reference

    const newData = obj.data();
    expect(originalData).not.toBe(newData);
    expect(originalData).toEqual(newData);
  });
});
