import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import storageDriver from '@cycle/storage';

import experiment from './components/experiment';

const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  Storage: storageDriver,
};

Cycle.run(experiment, drivers);
