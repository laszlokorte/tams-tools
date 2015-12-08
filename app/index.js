import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import storageDriver from '@cycle/storage';

import kv from './components/kv';

const drivers = {
  DOM: makeDOMDriver('#app'),
  Storage: storageDriver,
};

Cycle.run(kv, drivers);
