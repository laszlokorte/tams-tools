import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';
import {preventDefaultDriver} from './drivers/prevent-default';
import {keyboardDriver} from './drivers/keyboard';
import {autoResizeDriver} from './drivers/textarea-resize';

import logic from './components/logic';
import tree from './components/tree';
import splitPane from './components/splitpane';

const logicApp = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
    autoResize,
  } = sources;

  const logicComponent = isolate(logic)({
    DOM, preventDefault, keydown, autoResize,
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
      logic.preventDefault,
      treeComponent.preventDefault,
      splitComponent.preventDefault
    ),
    autoResize: logicComponent.autoResize,
  };
};

const driversSplit = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
};

Cycle.run(logicApp, driversSplit);
