import {Observable as O, Subject} from 'rx';
import isolate from '@cycle/isolate';

import Field from './input-field';

import model from './model';
import view from './view';
import intent from './intent';
import TableComponent from '../table';
import asciiTable from '../table/lib/format-ascii';

import modalPanels from './panels';

// initialize the logic editor component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
}) => {
  // subjects are forward declarations of data streams
  // of child components that are initialized later
  //
  // These subjects are needed so the intent() and model() function
  // can use data that is produced by the Table and Panel functions
  // which are called later.
  const openData$ = new Subject();
  const selectedRow$ = new Subject();

  const actions = intent({
    DOM,
    openData$,
  });

  // the text field for entering the logic expression
  const field = isolate(Field, 'logic-field')({
    DOM,
    input$: actions.openData$.map(::JSON.parse),
  });

  const state$ = model(
    actions, field.output$,
    selectedRow$
  );

  // the operator tree representing the current expression
  const tree$ = state$
    .map((s) => s.tree)
    .share();

  // the function table for the current expression
  const table$ = state$
    .distinctUntilChanged((s) => s.table)
    .map((state) => state.table)
    .share();

  // the current expression formatted as a string
  const formula$ = state$
    .map((s) => s.formula)
    .share();

  // the table component displaying the function table
  const tableComponent = isolate(TableComponent, 'table')({
    DOM,
    table$,
  });

  // the modal panels
  const panels = modalPanels({
    DOM, globalEvents, open$: actions.panel$,
    asciiTable$: table$.map(asciiTable),
    formula$, tree$,
  });

  const vtree$ = view(
    state$, field.DOM, tableComponent.DOM,
    O.combineLatest( // extract DOM streams from modal panels
      Object.values(panels).map((p) => p.DOM)
    )
  );

  // connect the output of the table component with the selectedRow$ subject
  // which is declared at the top of this function
  tableComponent.selectedRow$.subscribe(selectedRow$);
  // connect the output of the "open" panel with the openData$ subject
  panels.open.data$.subscribe(openData$);

  return {
    DOM: vtree$,
    preventDefault: O.merge([
      actions.preventDefault,
      field.preventDefault,
      panels.open.preventDefault,
    ]).share(),
    autoResize: field.autoResize,
    selectAll: panels.save.selectAll,
    tree$: tree$,
    insertString: field.insertString,
  };
};
