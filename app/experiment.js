import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import storageDriver from '@cycle/storage';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';

import experiment from './components/experiment';

const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app-main')),
  Storage: storageDriver,
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
};

Cycle.run(experiment, drivers);
