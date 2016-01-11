import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';

import led from './components/led';

const drivers = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
};

Cycle.run(led, drivers);

