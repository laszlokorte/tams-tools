import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';
import {insertStringDriver} from '../../drivers/rangy';

import logic from '../../components/logic';
import tree from '../../components/tree';
import splitPane from '../../components/splitpane';

const logicApp = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
    autoResize,
    selectAll,
    globalEvents,
  } = sources;

  const logicComponent = isolate(logic)({
    DOM, preventDefault, keydown, autoResize, selectAll,
  });

  const treeComponent = isolate(tree)({
    DOM, preventDefault, keydown, globalEvents,
    data$: logicComponent.tree$,
    props$: O.just({
      scaleX: 150,
      scaleY: 150,
    }),
  });

  const logicDOM = logicComponent.DOM;
  const treeDOM = treeComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    globalEvents,
    props$: O.just({proportion: 0.65}),
    firstChild$: logicDOM,
    secondChild$: treeDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge([
      logicComponent.preventDefault,
      treeComponent.preventDefault,
      splitComponent.preventDefault,
    ]),
    selectAll: logicComponent.selectAll,
    autoResize: logicComponent.autoResize,
    insertString: logicComponent.insertString,
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
  insertString: insertStringDriver,
};

Cycle.run(logicApp, drivers);
