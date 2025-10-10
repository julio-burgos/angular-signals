import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { deepSignal, deepComputed, spring, tween } from 'angular-signals';

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
}
