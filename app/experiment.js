import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import storageDriver from '@cycle/storage';

import experiment from './components/experiment';

const drivers = {
  DOM: makeDOMDriver('#app'),
  Storage: storageDriver,
};

Cycle.run(experiment, drivers);
