import {Observable as O, Subject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';
import {toPLA, toJSON} from './lib/diagram';

import HelpPanel from './panels/help';
import SettingsPanel from './panels/settings';
import OpenPanel from './panels/open';
import SavePanel from './panels/save';

export default (responses) => {
  const {
    DOM,
    keydown,
    globalEvents,
  } = responses;

  const openData$ = new Subject();
  const importExpression$ = new Subject();
  const viewSetting$ = new Subject();

  const actions = intent({
    DOM, globalEvents, keydown,
    openData$,
    importExpression$,
    viewSetting$: viewSetting$,
  });

  const state$ = model(O.empty(), actions).shareReplay(1);

  const plaData$ = state$.debounce(10).map(({state}) =>
    toPLA(state.diagram, state.currentKvMode, state.currentCube)
  ).share();

  const jsonData$ = state$.map(({state}) =>
    JSON.stringify(toJSON(state.diagram))
  ).share();

  const helpPanel = isolate(HelpPanel, 'helpPanel')({
    DOM,
    keydown,
    visible$: actions.panel$
      .map((p) => p === 'help'),
  });

  const settingsPanel = isolate(SettingsPanel, 'settingsPanel')({
    DOM,
    keydown,
    visible$: actions.panel$
      .map((p) => p === 'settings'),
    viewSetting$: O.just('function'),
  });

  const openPanel = isolate(OpenPanel, 'openPanel')({
    DOM,
    keydown,
    visible$: actions.panel$
      .map((p) => p === 'open'),
  });

  const savePanel = isolate(SavePanel, 'savePanel')({
    DOM,
    keydown,
    pla$: plaData$,
    json$: jsonData$,
    visible$: actions.panel$
      .map((p) => p === 'save'),
  });

  const vtree$ = view(
    state$, {
      panel$s: [
        helpPanel.DOM,
        settingsPanel.DOM,
        openPanel.DOM,
        savePanel.DOM,
      ],
    }
  );

  openPanel.data$.subscribe(openData$);
  openPanel.expression$.subscribe(importExpression$);
  settingsPanel.viewSetting$.subscribe(viewSetting$);

  return {
    DOM: vtree$,
    plaData$,
    preventDefault: O.merge([
      actions.preventDefault,
      openPanel.preventDefault,
    ]).share(),
    selectAll: savePanel.selectAll,
    autoResize: openPanel.autoResize,
    insertString: openPanel.insertString,
  };
};
