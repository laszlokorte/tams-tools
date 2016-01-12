import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';

import logic from './components/logic';

const drivers = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
};

Cycle.run(logic, drivers);

