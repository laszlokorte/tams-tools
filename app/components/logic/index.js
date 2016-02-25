import {ReplaySubject, Subject} from 'rx';
import I from 'immutable';
import isolate from '@cycle/isolate';

import {expressionToString} from './lib/formatter';
import {evaluateExpression} from './lib/evaluation';

import model from './model';
import view from './view';
import intent from './intent';
import TableComponent from '../table';
import asciiTable from '../table/lib/format-ascii';

import mathFormatter from './lib/formatter/math';
import latexFormatter from './lib/formatter/latex';
import pythonFormatter from './lib/formatter/python';
import cBitwiseFormatter from './lib/formatter/c-bitwise';
import cBooleanFormatter from './lib/formatter/c-boolean';

import toTree from './lib/tree';
import toTable from './lib/table';

import HelpPanel from './panels/help';
import OpenPanel from './panels/open';
import SavePanel from './panels/save';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const tableSubject = new ReplaySubject(1);
  const formulaSubject = new Subject();
  const panelSubject = new Subject();

  const helpPanel = isolate(HelpPanel, 'helpPanel')({
    DOM,
    keydown,
    visible$: panelSubject
      .map((p) => p === 'help'),
  });

  const openPanel = isolate(OpenPanel, 'openPanel')({
    DOM,
    keydown,
    visible$: panelSubject
      .map((p) => p === 'open'),
  });

  const savePanel = isolate(SavePanel, 'savePanel')({
    DOM,
    keydown,
    table$: tableSubject.map(asciiTable),
    formula$: formulaSubject,
    visible$: panelSubject
      .map((p) => p === 'save'),
  });

  const tableComponent = isolate(TableComponent)({
    DOM,
    table$: tableSubject,
  });

  const actions = intent({
    DOM,
    keydown,
    openData$: openPanel.data$,
  });

  const state$ = model(actions).shareReplay(1);
  const vtree$ = view(state$, tableComponent.DOM, {
    panel$s: [
      helpPanel.DOM,
      openPanel.DOM,
      savePanel.DOM,
    ],
  });

  const tree$ = state$.debounce(300).flatMapLatest(
    (state) => {
      return tableComponent.selectedRow$
        .startWith(null)
        .map((selectedRow) => {
          if (state &&
            state.context &&
            state.context.expressions.size > 0
          ) {
            let subEvalutation = null;
            if (selectedRow !== null) {
              const identifierMap = I.Map(state.context.freeIdentifiers.map(
                (name, i) => [name, !!(Math.pow(2, i) & selectedRow)]
              ));

              const evaluate = (expr) =>
                expr.node === 'group' ? evaluate(expr.content) :
                [expr, evaluateExpression(expr, identifierMap)]
              ;

              subEvalutation = I.Map(state.context.toplevelExpressions.map(
                (e) => evaluate(e.content))
              )
              .merge(
                I.Map(state.context.subExpressions.map(evaluate))
              )
              .merge(identifierMap);
            }

            if (state.context.expressions.size === 1) {
              return toTree(state.context.expressions.get(0), subEvalutation);
            } else {
              return {
                name: 'Expression List',
                children: state.context.expressions.map(
                  (e) => toTree(e, subEvalutation)
                ).toArray(),
                hidden: true,
              };
            }
          } else {
            return null;
          }
        });
    }
  ).share();

  const formatters = {
    math: mathFormatter,
    latex: latexFormatter,
    python: pythonFormatter,
    'c-bitwise': cBitwiseFormatter,
    'c-boolean': cBooleanFormatter,
  };

  const formatter$ = actions.selectFormat$
    .startWith('math')
    .map((formatName) => {
      return formatters[formatName] || mathFormatter;
    })
    .shareReplay(1);

  const table$ = state$.debounce(300).combineLatest(
    formatter$,
    (state, formatter) =>
    state.context &&
    state.context.expressions.size ? toTable(
      state.context,
      state.showSubExpressions,
      formatter
    ) : null
  ).share();

  const formula$ = state$.combineLatest(
    formatter$,
    (state, formatter) => {
      return state.context ? state.context.expressions.map(
        (e) => expressionToString(e.content, formatter)
      ).join(', ') : '';
    }
  ).share();

  formula$.subscribe(formulaSubject);
  table$.subscribe(tableSubject);
  actions.panel$.subscribe(panelSubject);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    selectAll: savePanel.selectAll,
    tree$: tree$,
    insertString: actions.insertString$,
  };
};
