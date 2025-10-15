import {signal, WritableSignal, computed, CreateSignalOptions} from '@angular/core';
import {isEqual} from 'lodash-es';


export function deepSignal<T>(value: T, options?: CreateSignalOptions<T> | undefined): WritableSignal<T> {
  return signal(value, {...options, equal: isEqual});
}


