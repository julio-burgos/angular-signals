import {signal, WritableSignal, computed} from '@angular/core';
import {isEqual} from 'lodash-es';


export function deepSignal<T>(value: T): WritableSignal<T> {
  return signal(value, {equal: isEqual});
}


