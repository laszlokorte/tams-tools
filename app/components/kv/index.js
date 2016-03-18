import {Observable as O, Subject} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';
import {toPLA, toJSON} from './lib/diagram';

import modalPanels from './panels';

// initialize the kv editor component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
}) => {
  const openData$ = new Subject();
  const importExpression$ = new Subject();
  const viewSetting$ = new Subject();

  const actions = intent({
    DOM, globalEvents,
    openData$,
    importExpression$,
    viewSetting$: viewSetting$,
  });

  const state$ = model(O.empty(), actions);

  const plaData$ = state$.map(({state}) =>
    toPLA(state.diagram, state.currentKvMode, state.currentLoop.cube)
  ).share();

  const jsonData$ = state$.map(({state}) =>
    JSON.stringify(toJSON(state.diagram))
  ).share();

  const panels = modalPanels({
    DOM, globalEvents,
    open$: actions.panel$,
    plaData$,
    jsonData$,
  });

  const vtree$ = view(
    state$,
    O.combineLatest(
      Object.values(panels).map((p) => p.DOM)
    )
  );

  panels.open.data$.subscribe(openData$);
  panels.open.expression$.subscribe(importExpression$);
  panels.settings.viewSetting$.subscribe(viewSetting$);

  return {
    DOM: vtree$,
    plaData$,
    preventDefault: O.merge([
      actions.preventDefault,
      panels.open.preventDefault,
    ]).share(),
    selectAll: panels.save.selectAll,
    autoResize: panels.open.autoResize,
    insertString: panels.open.insertString,
  };
};
