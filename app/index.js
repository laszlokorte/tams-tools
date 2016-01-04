import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';

import kv from './components/kv';
import pla from './components/pla';

const drivers = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
};

const {sinks: {plaData$}} = Cycle.run(kv, drivers);

const driversAssistent = {
  DOM: makeHammerDriver(makeDOMDriver('#app-assistent')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  props$: () => O.just({}),
  data$: () => plaData$,
};

Cycle.run(pla, driversAssistent);
