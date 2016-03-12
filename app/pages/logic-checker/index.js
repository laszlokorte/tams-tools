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

import LogicField from '../../components/logic/input-field';
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

  const logicField1 = isolate(LogicField)({
    DOM, preventDefault, keydown, autoResize, selectAll,
  });

  const logicField2 = isolate(LogicField)({
    DOM, preventDefault, keydown, autoResize, selectAll,
  });

  const leftDOM = logicField1.DOM;
  const rightDOM = logicField2.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    globalEvents,
    props$: O.just({proportion: 0.50}),
    firstChild$: leftDOM,
    secondChild$: rightDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge([
      logicField1.preventDefault,
      logicField2.preventDefault,
      splitComponent.preventDefault,
    ]),
    selectAll: O.merge([
      logicField1.selectAll,
      logicField2.selectAll,
    ]),
    autoResize: O.merge([
      logicField1.autoResize,
      logicField2.autoResize,
    ]),
    insertString: O.merge([
      logicField1.insertString,
      logicField2.insertString,
    ]),
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
