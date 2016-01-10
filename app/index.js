import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';

import kv from './components/kv';
import pla from './components/pla';

/*
  This file is the entry point for the application
  It set's up the CycleJS drivers and starts
  the CycleJS main loop with the main function
*/

// The drivers for the kv editor
const drivers = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
};

// This is the KV diagram editor
// It outputs a Stream of PLA data.
const {sinks: {plaData$}} = Cycle.run(kv, drivers);

// The drivers for the PLA circuit renderer
const driversAssistent = {
  // The HammerDriver enabled support for touch events
  DOM: makeHammerDriver(makeDOMDriver('#app-assistent')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  props$: () => O.just({}),
  // The PLA circuit renderer get's the plaData$ which
  // is produced from the kv diagram editor as input
  data$: () => plaData$,
};

// This is the PLA circuit renderer
Cycle.run(pla, driversAssistent);
