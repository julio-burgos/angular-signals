import '@angular/compiler';

import { BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

const testbed = getTestBed();

testbed.initTestEnvironment(
  [BrowserTestingModule],

  platformBrowserTesting()
);


// Configure TestBed globally before each test
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
    ],
  });
});

// Clean up after each test
afterEach(() => {
  TestBed.resetTestingModule();
});
