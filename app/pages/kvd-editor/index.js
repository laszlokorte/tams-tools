import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';

import kv from '../../components/kv';
import pla from '../../components/pla';
import splitPane from '../../components/splitpane';

/*
  This file is the entry point for the application
  It set's up the CycleJS drivers and starts
  the CycleJS main loop with the main function
*/

const kvdApp = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
    globalEvents,
  } = sources;

  const kvComponent = isolate(kv)({
    DOM, preventDefault, keydown,
  });

  const plaComponent = isolate(pla)({
    DOM, preventDefault, keydown,
    globalEvents,
    data$: kvComponent.plaData$,
    props$: O.just({}),
  });

  const kvDOM = kvComponent.DOM;
  const plaDOM = plaComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    globalEvents,
    props$: O.just({proportion: 0.65}),
    firstChild$: kvDOM,
    secondChild$: plaDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge([
      kvComponent.preventDefault,
      plaComponent.preventDefault,
      splitComponent.preventDefault,
    ]),
    selectAll: O.merge([
      kvComponent.selectAll,
    ]),
  };
};

// The drivers for the kv editor
const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(kvdApp, drivers);
