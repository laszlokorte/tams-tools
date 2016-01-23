import {Observable as O, ReplaySubject, Subject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';

import toTree from './lib/tree';

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
    table$: tableSubject,
    visible$: panelSubject
      .map((p) => p === 'save'),
  });

  const actions = intent(DOM, keydown);
  const state$ = model(actions).shareReplay(1);
  const vtree$ = view(state$, {
    panel$s: [
      helpPanel.DOM,
      openPanel.DOM,
      savePanel.DOM,
    ],
  });

  actions.panel$.subscribe(panelSubject);
  state$.subscribe(tableSubject);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    selectAll: savePanel.selectAll,
    tree$: state$.debounce(200).map(
      (state) => {
        if (state &&
          state.expressions &&
          state.expressions.size > 0
        ) {
          if (state.expressions.size === 1) {
            return toTree(state.expressions.get(0), state.subEvalutation);
          } else {
            return {
              name: 'Expression List',
              children: state.expressions.map(
                (e) => toTree(e, state.subEvalutation)
              ).toArray(),
              hidden: true,
            };
          }
        } else {
          return null;
        }
      }
    ),
  };
};
