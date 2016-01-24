import {ReplaySubject, Subject} from 'rx';
import I from 'immutable';
import isolate from '@cycle/isolate';

import {evaluateExpression} from './lib/expression';

import model from './model';
import view from './view';
import intent from './intent';
import TableComponent from '../table';
import asciiTable from '../table/lib/format-ascii';

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

  const tableSubject = new ReplaySubject();
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
    visible$: panelSubject
      .map((p) => p === 'save'),
  });

  const tableComponent = isolate(TableComponent)({
    DOM,
    table$: tableSubject,
  });

  const actions = intent(DOM, keydown);
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
            state.expressions &&
            state.expressions.size > 0
          ) {
            let subEvalutation = null;
            if (selectedRow !== null) {
              const identifierMap = I.Map(state.identifiers.map(
                (name, i) => [name, !!(Math.pow(2, i) & selectedRow)]
              ));

              subEvalutation = I.Map(state.toplevelExpressions.map((expr) =>
                [expr, evaluateExpression(expr, identifierMap)]
              )).merge(identifierMap);
            }

            if (state.expressions.size === 1) {
              return toTree(state.expressions.get(0), subEvalutation);
            } else {
              return {
                name: 'Expression List',
                children: state.expressions.map(
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

  const table$ = state$.map((state) =>
    state.error ? null : toTable(
      state.identifiers,
      state.toplevelExpressions,
      state.showSubExpressions ?
        state.subExpressions : void 0
    )
  ).share();

  table$.subscribe(tableSubject);
  actions.panel$.subscribe(panelSubject);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    selectAll: savePanel.selectAll,
    tree$: tree$,
  };
};
