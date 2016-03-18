import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';

import LedComponent from '../../components/led';

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
};

// start the LED component
Cycle.run(LedComponent, drivers);

