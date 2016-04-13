import {Observable as O, Subject} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {stopPropagationDriver} from '../../drivers/stop-propagation';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';

import FSMComponent from '../../components/fsm';
import GraphComponent from '../../components/graph';
import splitPane from '../../components/splitpane';

// initialize the FSM editor page
const fsmEditor = (sources) => {
  const {
    DOM, // The DOM driver source
    globalEvents, // The globalEvent driver source
  } = sources;

  const graphActionProxy = new Subject();
  const graphSelectionProxy = new Subject();

  // The FSM editor to be shown on the left side
  const fsmComponent = isolate(FSMComponent, 'fsm-editor')({
    DOM,
    globalEvents,
    graphAction$: graphActionProxy,
    graphSelection$: graphSelectionProxy,
  });

  // The graph editor to be shown on the right side
  const graphComponent = isolate(GraphComponent, 'graph-editor')({
    DOM,
    globalEvents,
    data$: fsmComponent.graph$,
    enabled$: fsmComponent.mode$.map((m) => m === 'edit'),
    resetSelection$: fsmComponent.resetSelection$,
  });

  graphComponent.action$.subscribe(graphActionProxy);
  graphComponent.selection$.subscribe(graphSelectionProxy);

  // The split component to display the left and right
  // side next to each other
  const splitComponent = isolate(splitPane, 'splitpane')({
    DOM,
    globalEvents,
    props$: O.just({proportion: 0.55}),
    firstChild$: fsmComponent.DOM,
    secondChild$: graphComponent.DOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge([
      fsmComponent.preventDefault,
      graphComponent.preventDefault,
      splitComponent.preventDefault,
    ]).share(),
    stopPropagation: graphComponent.stopPropagation,
    selectAll: O.empty(),
    autoResize: O.empty(),
  };
};

// setup the drivers to be used
const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  stopPropagation: stopPropagationDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
};

// start the application
Cycle.run(fsmEditor, drivers);
