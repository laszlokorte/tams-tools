import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {insertStringDriver} from '../../drivers/rangy';

import kv from '../../components/kv';
import pla from '../../components/pla';
import splitPane from '../../components/splitpane';

/*
  This file is the entry point for the application
  It set's up the CycleJS drivers and starts
  the CycleJS main loop with the main function
*/

// initialize the FSM editor page
const kvdApp = (sources) => {
  const {
    DOM, // The DOM driver source
    globalEvents, // The globalEvent driver source
  } = sources;

  // initialize the kv editor component
  const kvComponent = isolate(kv, 'kv-editor')({
    DOM, globalEvents,
  });

  // initialize the PLA component
  const plaComponent = isolate(pla, 'pla-viewer')({
    DOM,
    globalEvents,
    data$: kvComponent.plaData$.take(1).merge(
      kvComponent.plaData$.skip(1).debounce(100)
    ).share(),
    props$: O.just({}),
  });

  // The split component to display the left and right
  // side next to each other
  const splitComponent = isolate(splitPane, 'splitpane')({
    DOM,
    globalEvents,
    props$: O.just({proportion: 0.65}),
    firstChild$: kvComponent.DOM,
    secondChild$: plaComponent.DOM,
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
    autoResize: kvComponent.autoResize,
    insertString: kvComponent.insertString,
  };
};

// The drivers for the kv editor and pla components
const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
  autoResize: autoResizeDriver,
  insertString: insertStringDriver,
};

// start the application
Cycle.run(kvdApp, drivers);
