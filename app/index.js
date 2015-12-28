import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';

import kv from './components/kv';
import pla from './components/pla';

const drivers = {
  DOM: makeDOMDriver('#app'),
};

const {sinks: {plaData$}} = Cycle.run(kv, drivers);

const driversAssistent = {
  DOM: makeHammerDriver(makeDOMDriver('#app-assistent')),
  props$: () => O.just({}),
  data$: () => plaData$,
};

Cycle.run(pla, driversAssistent);
