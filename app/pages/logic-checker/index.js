import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, h1, h2, ul, li} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';
import {insertStringDriver} from '../../drivers/rangy';

import LogicField from '../../components/logic/input-field';

import './index.styl';

const render = (state, field1, field2) =>
  div([
    h1('Compare expressions'),
    div('.column', [
      h2('Expression 1'),
      field1,
    ]),
    div('.column', [
      h2('Expression 2'),
      field2,
    ]),
    state !== null ? div('.result', [
      state.length === 0 ?
      div('.no-differences', 'Expressions are equal') :
      div('.differences', [
        'The expressions differ:',
        ul('.diff-list', state.map((d) =>
          li('.diff-list-item', d)
        )),
      ]),
    ]) : null,
  ])
;

const diff = (outputA, outputB) => {
  if (outputA.error !== null || outputB.error !== null) {
    return null;
  }

  if (outputA.result.sortedExpressions.size === 0 &&
    outputB.result.sortedExpressions.size === 0) {
    return null;
  }

  let differences = [];

  if (outputA.result.freeIdentifiers.count() !==
    outputB.result.freeIdentifiers.count()) {
    differences.push('Different Identifiers');
  }

  return differences;
};

const logicApp = (sources) => {
  const {
    DOM,
    preventDefault,
    globalEvents,
    autoResize,
    selectAll,
  } = sources;

  const logicFieldA = isolate(LogicField)({
    DOM, preventDefault, globalEvents, autoResize, selectAll,
  });

  const logicFieldB = isolate(LogicField)({
    DOM, preventDefault, globalEvents, autoResize, selectAll,
  });

  const fieldADOM$ = logicFieldA.DOM;
  const fieldBDOM$ = logicFieldB.DOM;

  const state$ = O.combineLatest(
    logicFieldA.output$.do((a) => console.log(a.toJS())),
    logicFieldB.output$,
    diff
  );

  const vtree$ = O.combineLatest(
    state$, fieldADOM$, fieldBDOM$,
    render
  );

  return {
    DOM: vtree$,
    preventDefault: O.merge([
      logicFieldA.preventDefault,
      logicFieldB.preventDefault,
    ]),
    autoResize: O.merge([
      logicFieldA.autoResize,
      logicFieldB.autoResize,
    ]),
    insertString: O.merge([
      logicFieldA.insertString,
      logicFieldB.insertString,
    ]),
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
  insertString: insertStringDriver,
};

Cycle.run(logicApp, drivers);
