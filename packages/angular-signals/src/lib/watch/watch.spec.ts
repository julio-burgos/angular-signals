import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { watch } from './watch';

describe('watch', () => {


  it('should call callback when a dependency signal changes', () => {
    TestBed.runInInjectionContext(() => {
      const dep1 = signal(0);
      let callCount = 0;

      watch([dep1], () => {
        callCount++;
      });

      TestBed.tick(); // Initial call
      expect(callCount).toBe(1);

      dep1.set(1);
      TestBed.tick();
      expect(callCount).toBe(2);

      dep1.set(2);
      TestBed.tick();
      expect(callCount).toBe(3);
    });
  });

  it('should call callback when any dependency signal changes', () => {
    TestBed.runInInjectionContext(() => {
      const dep1 = signal(0);
      const dep2 = signal('a');
      const dep3 = signal(true);
      let callCount = 0;

      watch([dep1, dep2, dep3], () => {
        callCount++;
      });

      TestBed.tick(); // Initial call
      expect(callCount).toBe(1);

      dep1.set(1);
      TestBed.tick();
      expect(callCount).toBe(2);

      dep2.set('b');
      TestBed.tick();
      expect(callCount).toBe(3);

      dep3.set(false);
      TestBed.tick();
      expect(callCount).toBe(4);
    });
  });

  it('should NOT call callback when non-dependency signals change', () => {
    TestBed.runInInjectionContext(() => {
      const dep = signal(0);
      const nonDep = signal(100);
      let callCount = 0;
      let nonDepValue = 0;

      watch([dep], () => {
        callCount++;
        // Reference nonDep inside callback, but it's not a dependency
        nonDepValue = nonDep();
      });

      TestBed.tick(); // Initial call
      expect(callCount).toBe(1);
      expect(nonDepValue).toBe(100);

      // Change non-dependency signal - should NOT trigger callback
      nonDep.set(200);
      TestBed.tick();
      expect(callCount).toBe(1); // Still 1, not called again
      expect(nonDepValue).toBe(100); // Still old value since callback didn't run

      // Change dependency signal - should trigger callback
      dep.set(1);
      TestBed.tick();
      expect(callCount).toBe(2); // Now called
      expect(nonDepValue).toBe(200); // Now sees updated value
    });
  });

  it('should NOT call callback when signals referenced only in callback change', () => {
    TestBed.runInInjectionContext(() => {
      const dep = signal(0);
      const other1 = signal('a');
      const other2 = signal(10);
      const other3 = signal(true);
      let callCount = 0;
      let capturedValues = { other1: '', other2: 0, other3: false };

      watch([dep], () => {
        callCount++;
        // Reference multiple signals inside callback that are NOT dependencies
        capturedValues = {
          other1: other1(),
          other2: other2(),
          other3: other3(),
        };
      });

      TestBed.tick(); // Initial call
      expect(callCount).toBe(1);
      expect(capturedValues).toEqual({ other1: 'a', other2: 10, other3: true });

      // Change all non-dependency signals - should NOT trigger callback
      other1.set('b');
      TestBed.tick();
      expect(callCount).toBe(1);

      other2.set(20);
      TestBed.tick();
      expect(callCount).toBe(1);

      other3.set(false);
      TestBed.tick();
      expect(callCount).toBe(1);

      // Values are still old because callback hasn't run
      expect(capturedValues).toEqual({ other1: 'a', other2: 10, other3: true });

      // Now change the dependency - callback should run and see new values
      dep.set(1);
      TestBed.tick();
      expect(callCount).toBe(2);
      expect(capturedValues).toEqual({ other1: 'b', other2: 20, other3: false });
    });
  });

  it('should track only signals in deps array, not callback body', () => {
    TestBed.runInInjectionContext(() => {
      const tracked = signal(0);
      const untracked1 = signal(100);
      const untracked2 = signal(200);
      const callLog: Array<{ tracked: number; untracked1: number; untracked2: number }> = [];

      watch([tracked], () => {
        callLog.push({
          tracked: tracked(),
          untracked1: untracked1(),
          untracked2: untracked2(),
        });
      });

      TestBed.tick(); // Initial call
      expect(callLog).toHaveLength(1);
      expect(callLog[0]).toEqual({ tracked: 0, untracked1: 100, untracked2: 200 });

      // Change untracked signals - no new callback execution
      untracked1.set(101);
      untracked2.set(201);
      TestBed.tick();
      expect(callLog).toHaveLength(1); // Still just the initial call

      // Change tracked signal - callback executes and sees updated values
      tracked.set(1);
      TestBed.tick();
      expect(callLog).toHaveLength(2);
      expect(callLog[1]).toEqual({ tracked: 1, untracked1: 101, untracked2: 201 });
    });
  });

  it('should handle empty dependency array', () => {
    TestBed.runInInjectionContext(() => {
      const nonDep = signal(0);
      let callCount = 0;

      watch([], () => {
        callCount++;
        nonDep(); // Reference signal but it shouldn't be tracked
      });

      TestBed.tick(); // Initial call
      expect(callCount).toBe(1);

      nonDep.set(1);
      TestBed.tick();
      expect(callCount).toBe(1); // No new calls
    });
  });

  it('should allow cleanup via effect cleanup', () => {
    TestBed.runInInjectionContext(() => {
      const dep = signal(0);
      let callCount = 0;

      const effectRef = watch([dep], () => {
        callCount++;
      });

      TestBed.tick();
      expect(callCount).toBe(1);

      dep.set(1);
      TestBed.tick();
      expect(callCount).toBe(2);

      // Cleanup the effect
      effectRef.destroy();

      dep.set(2);
      TestBed.tick();
      expect(callCount).toBe(2); // No new calls after cleanup
    });
  });

  it('should run callback in untracked context', () => {
    TestBed.runInInjectionContext(() => {
      const dep = signal(0);
      const inner = signal(100);
      let callCount = 0;
      let innerValue = 0;

      watch([dep], () => {
        callCount++;
        // This should not create a new dependency
        innerValue = inner();
      });

      TestBed.tick();
      expect(callCount).toBe(1);
      expect(innerValue).toBe(100);

      // Changing inner should not trigger callback
      inner.set(200);
      TestBed.tick();
      expect(callCount).toBe(1);
      expect(innerValue).toBe(100); // Still old value

      // Changing dep should trigger callback
      dep.set(1);
      TestBed.tick();
      expect(callCount).toBe(2);
      expect(innerValue).toBe(200); // Now updated
    });
  });
});
