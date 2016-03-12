import {Observable as O, Subject} from 'rx';
import isolate from '@cycle/isolate';

import Field from './input-field';

import model from './model';
import view from './view';
import intent from './intent';
import TableComponent from '../table';
import asciiTable from '../table/lib/format-ascii';

import HelpPanel from './panels/help';
import OpenPanel from './panels/open';
import SavePanel from './panels/save';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const tableSubject = new Subject();
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

  const field = isolate(Field)({DOM, input$: openPanel.data$});

  const state$ = model(
    actions, field.output$,
    tableComponent.selectedRow$
  ).shareReplay(1);

  const vtree$ = view(state$, field.DOM, tableComponent.DOM, {
    panel$s: [
      helpPanel.DOM,
      openPanel.DOM,
      savePanel.DOM,
    ],
  });

  const tree$ = state$.map((s) => s.tree).share();

  const table$ = state$
    .distinctUntilChanged((s) => s.table)
    .map((state) => state.table).share();

  const formula$ = state$.map((s) => s.formula).share();

  formula$.subscribe(formulaSubject);
  table$.subscribe(tableSubject);
  actions.panel$.subscribe(panelSubject);

  return {
    DOM: vtree$,
    preventDefault: O.merge([
      actions.preventDefault,
      field.preventDefault,
    ]),
    autoResize: field.autoResize,
    selectAll: savePanel.selectAll,
    tree$: tree$,
    insertString: field.insertString,
  };
};
