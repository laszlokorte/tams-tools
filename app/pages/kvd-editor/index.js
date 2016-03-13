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

const kvdApp = (sources) => {
  const {
    DOM,
    preventDefault,
    globalEvents,
  } = sources;

  const kvComponent = isolate(kv)({
    DOM, globalEvents, preventDefault,
  });

  const plaComponent = isolate(pla)({
    DOM, preventDefault,
    globalEvents,
    data$: kvComponent.plaData$.take(1).merge(
      kvComponent.plaData$.skip(1).debounce(100)
    ).share(),
    props$: O.just({}),
  });

  const kvDOM = kvComponent.DOM;
  const plaDOM = plaComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
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
    autoResize: kvComponent.autoResize,
    insertString: kvComponent.insertString,
  };
};

// The drivers for the kv editor
const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
  autoResize: autoResizeDriver,
  insertString: insertStringDriver,
};

Cycle.run(kvdApp, drivers);
