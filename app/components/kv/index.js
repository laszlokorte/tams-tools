import {Observable as O, ReplaySubject, Subject} from 'rx';
import isolate from '@cycle/isolate';

import model from './model';
import view from './view';
import intent from './intent';
import {toPLA, toJSON} from './model/diagram';

import HelpPanel from './panels/help';
import SettingsPanel from './panels/settings';
import OpenPanel from './panels/open';
import SavePanel from './panels/save';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const plaSubject = new ReplaySubject();
  const jsonSubject = new ReplaySubject();
  const panelSubject = new Subject();

  const helpPanel = isolate(HelpPanel, 'helpPanel')({
    DOM,
    keydown,
    visible$: panelSubject
      .map((p) => p === 'help'),
  });

  const settingsPanel = isolate(SettingsPanel, 'settingsPanel')({
    DOM,
    keydown,
    visible$: panelSubject
      .map((p) => p === 'settings'),
    viewSetting$: O.just('function'),
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
    pla$: plaSubject,
    json$: jsonSubject,
    visible$: panelSubject
      .map((p) => p === 'save'),
  });

  const actions = intent({
    DOM, keydown,
    openData$: openPanel.data$,
    viewSetting$: settingsPanel.viewSetting$,
  });

  const state$ = model(O.empty(), actions).shareReplay(1);
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

  const plaData$ = state$.delay(0).debounce(10).map(({state}) =>
    toPLA(state.diagram, state.currentKvMode, state.currentCube)
  );

  actions.panel$.subscribe(panelSubject);
  plaData$.subscribe(plaSubject);
  state$.map(({state}) =>
    JSON.stringify(toJSON(state.diagram))
  ).subscribe(jsonSubject);

  return {
    DOM: vtree$,
    plaData$,
    preventDefault: O.merge(
      actions.preventDefault,
      openPanel.preventDefault
    ).share(),
  };
};
