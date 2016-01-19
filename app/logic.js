import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';
import {autoResizeDriver} from './drivers/textarea-resize';

import logic from './components/logic';
import tree from './components/tree';

const drivers = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
};

const {sinks: {tree$}} = Cycle.run(logic, drivers);

// The drivers for the PLA circuit renderer
const driversAssistent = {
  // The HammerDriver enabled support for touch events
  DOM: makeHammerDriver(makeDOMDriver('#app-assistent')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  props$: () => O.just({}),
  // The PLA circuit renderer get's the plaData$ which
  // is produced from the kv diagram editor as input
  data$: () => tree$,
};

// This is the PLA circuit renderer
Cycle.run(tree, driversAssistent);
