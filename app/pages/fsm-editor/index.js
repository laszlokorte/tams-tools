import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {stopPropagationDriver} from '../../drivers/stop-propagation';
import {keyboardDriver} from '../../drivers/keyboard';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';

import FSMComponent from '../../components/fsm';
import GraphComponent from '../../components/graph';
import splitPane from '../../components/splitpane';

const fsmEditor = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
    globalEvents,
  } = sources;

  const fsmComponent = isolate(FSMComponent)({
    DOM,
    keydown,
  });

  const graphComponent = isolate(GraphComponent)({
    DOM,
    keydown,
    globalEvents,
    data$: fsmComponent.graph$,
  });

  const leftDOM = fsmComponent.DOM;
  const rightDOM = graphComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    globalEvents,
    props$: O.just({proportion: 0.65}),
    firstChild$: leftDOM,
    secondChild$: rightDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge([
      fsmComponent.preventDefault,
      graphComponent.preventDefault,
      splitComponent.preventDefault,
    ]),
    stopPropagation: graphComponent.stopPropagation,
    selectAll: O.empty(),
    autoResize: O.empty(),
  };
};

const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  stopPropagation: stopPropagationDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(fsmEditor, drivers);
