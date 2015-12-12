import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';

import kv from './components/kv';

const drivers = {
  DOM: makeDOMDriver('#app'),
};

Cycle.run(kv, drivers);
