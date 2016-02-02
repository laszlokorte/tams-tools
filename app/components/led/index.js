import {ReplaySubject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';
import toTable from './lib/table';

import TableComponent from '../table';

export default (responses) => {
  const {
    DOM,
    keydown,
    data$,
  } = responses;

  const tableSubject = new ReplaySubject(1);

  const tableComponent = isolate(TableComponent)({
    DOM,
    table$: tableSubject,
  });

  const actions = intent({
    DOM,
    keydown,
    selectIndex$: tableComponent.selectedRow$,
  });
  const state$ = model(data$, actions).shareReplay(1);
  const vtree$ = view(state$, tableComponent.DOM);

  const table$ = state$.map(toTable);
  table$.subscribe(tableSubject);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
  };
};
