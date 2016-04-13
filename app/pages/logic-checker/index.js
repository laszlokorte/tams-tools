import {Observable as O} from 'rx';
import I from 'immutable';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {
  div, h1, h2, ul, li, p,
  table, tr, th, td, tbody,
} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';
import {insertStringDriver} from '../../drivers/rangy';

import LogicField from '../../components/logic/input-field';
import {compareNetworks} from '../../components/logic/lib/diff';
import {expressionToString} from '../../components/logic/lib/formatter';
import formatter from '../../components/logic/lib/formatter/c-bitwise';

import './index.styl';

const renderReason = (comparison) => {
  const freeIdentifiers = I.List(
    comparison.reasons.get(0).identifierMap.entries()
  )
  .filter(([id]) => id._name === 'identifier')
  .map(([id]) => id);

  return table('.table', [
    tr('.table-head-row', [
      freeIdentifiers
      .map((id) => th('.table-head-cell', [
        id.name,
      ]))
      .toArray(),
      th('.table-head-cell', [
        expressionToString(
          comparison.expressionA.body, formatter
        ),
      ]),
      th('.table-head-cell', [
        expressionToString(
          comparison.expressionB.body, formatter
        ),
      ]),
    ]),
    tbody(comparison.reasons.map((row) => tr(
    '.table-body-row' + (
      row.valueA !== row.valueB ? '.difference' : ''
    ), [
      freeIdentifiers
      .map((id) => td('.table-body-cell', [
        formatter.formatValue(
          row.identifierMap.get(id)
        ),
      ]))
      .toArray(),
      td('.table-body-cell.marked', [
        formatter.formatValue(
          row.valueA
        ),
      ]),
      td('.table-body-cell.marked', [
        formatter.formatValue(
          row.valueB
        ),
      ]),
    ])).toArray()),
  ]);
};

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
      state.error && div('.error', state.error),
      state.unifications.isEmpty() ? null :
      div('.warning', [
        'Identifier names do not match.',
        'The following non matching identifiers have been unified:',
        p('.warning-details',
          formatter.formatExpressions(
            state.unifications.map((unification) =>
              formatter.formatLabel(
                formatter.formatName(unification.identifierA.name),
                formatter.formatName(unification.identifierB.name)
              )
            )
          )
        ),
      ]),

      div('.comparison', [
        ul('.comparison-list', state.comparisons.map((comparison) =>
          li('.comparison-list-item', {
            className: comparison.equal ? 'state-success' : 'state-fail',
          }, [
            div('.comparison-head', [
              `Comparing ${
                expressionToString(comparison.expressionA.body, formatter)
              } and ${
                expressionToString(comparison.expressionB.body, formatter)
              }`,
            ]),
            div('.comparison-result', {
              className: comparison.equal ? 'state-success' : 'state-fail',
            }, [
              comparison.equal ? 'Equal!' : 'Not Equal!',
              renderReason(comparison),
            ]),
          ])
        ).toArray()),
      ]),
    ]) : null,
  ])
;

const diff = (outputA, outputB) => {
  if (outputA.error !== null || outputB.error !== null) {
    return null;
  }

  if (outputA.network.sortedExpressions.size === 0 &&
    outputB.network.sortedExpressions.size === 0) {
    return null;
  }

  return compareNetworks(outputA.network, outputB.network);
};

const logicApp = (sources) => {
  const {
    DOM,
    globalEvents,
  } = sources;

  const logicFieldA = isolate(LogicField, 'logic-field-a')({
    DOM, globalEvents,
  });

  const logicFieldB = isolate(LogicField, 'logic-field-b')({
    DOM, globalEvents,
  });

  const fieldADOM$ = logicFieldA.DOM;
  const fieldBDOM$ = logicFieldB.DOM;

  const state$ = O.combineLatest(
    logicFieldA.output$,
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
