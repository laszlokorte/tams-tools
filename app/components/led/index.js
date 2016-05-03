import {Observable as O, Subject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';
import toTable from './lib/table';
import toExpression from './lib/expression';

import TableComponent from '../table';
import asciiTable from '../table/lib/format-ascii';

import modalPanels from './panels';

// initialize the led editor component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
}) => {
  const selectedRow$ = new Subject();
  const openData$ = new Subject();

  const actions = intent({
    DOM,
    globalEvents,
    selectIndex$: selectedRow$,
  });

  const state$ = model(openData$, actions);
  const table$ = state$.map(toTable).shareReplay(1);

  const tableComponent = isolate(TableComponent, 'table')({
    DOM,
    table$,
  });

  tableComponent.selectedRow$.subscribe(selectedRow$);

  const panels = modalPanels({
    DOM, globalEvents, open$: actions.panel$,
    asciiTable$: table$.map(asciiTable),
    formula$: state$.map(toExpression),
  });

  const vtree$ = view(
    state$, tableComponent.DOM,
    O.combineLatest(
      Object.values(panels).map((p) => p.DOM)
    )
  );

  panels.open.data$.map(::JSON.parse).subscribe(openData$);

  return {
    DOM: vtree$,
    selectAll: panels.save.selectAll,
    preventDefault: O.merge([
      actions.preventDefault,
      panels.open.preventDefault,
    ]).share(),
  };
};
