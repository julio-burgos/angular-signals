import '@angular/compiler';

import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

const testbed = getTestBed();


testbed.initTestEnvironment(
  [BrowserTestingModule,
  ],

  platformBrowserTesting(
  )
);
