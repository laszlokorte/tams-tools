import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';
import {autoResizeDriver} from './drivers/textarea-resize';
import {selectAllDriver} from './drivers/select-all';

import logic from './components/logic';
import tree from './components/tree';
import splitPane from './components/splitpane';

const logicApp = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
    autoResize,
    selectAll,
  } = sources;

  const logicComponent = isolate(logic)({
    DOM, preventDefault, keydown, autoResize, selectAll,
  });

  const treeComponent = isolate(tree)({
    DOM, preventDefault, keydown,
    data$: logicComponent.tree$,
    props$: O.just({}),
  });

  const logicDOM = logicComponent.DOM.shareReplay(1);
  const treeDOM = treeComponent.DOM.shareReplay(1);

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    props$: O.just({proportion: 0.65}),
    firstChild$: logicDOM,
    secondChild$: treeDOM,
  });

  logicDOM.subscribe();
  treeDOM.subscribe();

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge(
      logicComponent.preventDefault,
      treeComponent.preventDefault,
      splitComponent.preventDefault
    ),
    selectAll: logicComponent.selectAll,
    autoResize: logicComponent.autoResize,
  };
};

const driversSplit = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
};

Cycle.run(logicApp, driversSplit);
