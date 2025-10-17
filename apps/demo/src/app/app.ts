import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  deepSignal,
  deepComputed,
  spring,
  tween,
  usePrevious,
  useToggle,
  useCounter,
  useArray,
  useDebounce,
  useThrottle,
  useInterval,
  useTimeout,
  useNow,
  useMediaQuery,
  useEventListener,
  useLocalStorage,
  useSessionStorage
} from '@angular-signals/angular-signals'

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // DeepSignal Demo
  userProfile = deepSignal({
    name: 'John Doe',
    age: 30,
    address: {
      city: 'New York',
      country: 'USA',
    },
  });

  // DeepComputed Demo
  userSummary = deepComputed(() => {
    const profile = this.userProfile();
    return {
      displayName: `${profile.name} (${profile.age})`,
      location: `${profile.address.city}, ${profile.address.country}`,
    };
  });

  // Spring Animation Demo
  springDemo = spring(0, { stiffness: 0.15, damping: 0.8 });
  springPosition = spring([0, 0], { stiffness: 0.2, damping: 0.7 });

  // Tween Animation Demo
  tweenDemo = tween(0, { duration: 1000, delay: 0 });
  tweenWithDelay = tween(0, { duration: 800, delay: 500 });
  tweenPosition = tween([0, 0], {
    duration: 1200,
    easing: (t: number) => t * (2 - t), // ease-out-quad
  });

  // State Management Demos
  // usePrevious
  counterForPrevious = signal(0);
  previousCounter = usePrevious(this.counterForPrevious);

  // useToggle
  toggleDemo = useToggle(false);

  // useCounter
  counterDemo = useCounter(0, 0, 10);

  // useArray
  arrayDemo = useArray<string>(['Apple', 'Banana', 'Cherry']);
  newItem = signal('');

  // Async Demos
  // useDebounce
  searchInput = signal('');
  debouncedSearch = useDebounce(this.searchInput, { delay: 500 });

  // useThrottle
  scrollY = signal(0);
  throttledScrollY = useThrottle(this.scrollY, { delay: 200 });

  // Timing Demos
  // useInterval
  intervalDemo = useInterval(() => {
    console.log('Interval tick');
  }, 1000);

  // useTimeout
  timeoutDemo = useTimeout(() => {
    console.log('Timeout fired!');
  }, 3000);

  // useNow
  currentTime = useNow({ interval: 1000 });

  // Browser API Demos
  // useMediaQuery
  isMobile = useMediaQuery('(max-width: 768px)');
  isDesktop = useMediaQuery('(min-width: 1024px)');

  // useLocalStorage & useSessionStorage
  localStorageDemo = useLocalStorage('demo-key', 'Default value');
  sessionStorageDemo = useSessionStorage('session-key', 0);

  constructor() {
    // Setup event listener for window resize
    useEventListener(window, 'scroll', () => {
      this.scrollY.set(window.scrollY);
    });

    // Effect to log debounced search
    effect(() => {
      const search = this.debouncedSearch();
      if (search) {
        console.log('Debounced search:', search);
      }
    });
  }

  // DeepSignal methods
  updateName(name: string) {
    this.userProfile.set({
      ...this.userProfile(),
      name,
    });
  }

  updateAge(age: number) {
    this.userProfile.update((profile: typeof this.userProfile extends { (): infer T } ? T : never) => ({
      ...profile,
      age,
    }));
  }

  updateCity(city: string) {
    this.userProfile.update((profile: typeof this.userProfile extends { (): infer T } ? T : never) => ({
      ...profile,
      address: {
        ...profile.address,
        city,
      },
    }));
  }

  // Spring animation methods
  animateSpringTo(value: number) {
    this.springDemo.target.set(value);
  }

  animateSpringPosition(x: number, y: number) {
    this.springPosition.target.set([x, y]);
  }

  resetSpring() {
    this.springDemo.target.set(0);
    this.springPosition.target.set([0, 0]);
  }

  // Tween animation methods
  animateTweenTo(value: number) {
    this.tweenDemo.target.set(value);
  }

  animateTweenWithDelay(value: number) {
    this.tweenWithDelay.target.set(value);
  }

  animateTweenPosition(x: number, y: number) {
    this.tweenPosition.target.set([x, y]);
  }

  resetTween() {
    this.tweenDemo.target.set(0);
    this.tweenWithDelay.target.set(0);
    this.tweenPosition.target.set([0, 0]);
  }

  // State Management Methods
  incrementCounterForPrevious() {
    this.counterForPrevious.update(v => v + 1);
  }

  // Array methods
  addItem() {
    const item = this.newItem();
    if (item.trim()) {
      this.arrayDemo.push(item);
      this.newItem.set('');
    }
  }

  removeFirstItem() {
    this.arrayDemo.shift();
  }

  removeLastItem() {
    this.arrayDemo.pop();
  }

  clearArray() {
    this.arrayDemo.clear();
  }

  filterByQuery(query: string) {
    this.arrayDemo.filter((item: string) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Storage methods
  updateLocalStorage(value: string) {
    this.localStorageDemo.value.set(value);
  }

  incrementSessionStorage() {
    this.sessionStorageDemo.value.update((v: number) => v + 1);
  }
}
