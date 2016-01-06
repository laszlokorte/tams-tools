import {Observable as O, Subject} from 'rx';
import isolate from '@cycle/isolate';

import ModalBox from '../modal';

import model from './model';
import view from './view';
import intent from './intent';
import helpPanel from './help';
import settingsPanel from './settings';
import openPanel from './open';
import savePanel from './save';
import {toPLA} from './model/diagram';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const actions = intent(DOM, keydown);
  const helpBox = isolate(ModalBox, 'helpBox')({
    DOM,
    props$: actions.help$
      .startWith(true)
      .map((visible) => ({visible})),
    content$: O.just(helpPanel()),
    keydown,
  });

  const settingsDialogue = isolate(ModalBox, 'settingsDialogue')({
    DOM,
    props$: actions.settings$
      .startWith(false)
      .map((visible) => ({visible})),
    content$: O.just(settingsPanel()),
    keydown,
  });

  const openDialogue = isolate(ModalBox, 'openDialogue')({
    DOM,
    props$: actions.open$
      .startWith(false)
      .map((visible) => ({visible})),
    content$: O.just(openPanel()),
    keydown,
  });

  const plaSubject = new Subject();
  const saveDialogue = isolate(ModalBox, 'saveDialogue')({
    DOM,
    props$: actions.save$
      .startWith(false)
      .map((visible) => ({visible})),
    content$: O.just(savePanel(plaSubject.shareReplay(1))),
    keydown,
  });

  const state$ = model(O.empty(), actions).shareReplay(1);
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
      settings$: settingsDialogue.DOM,
      open$: openDialogue.DOM,
      save$: saveDialogue.DOM,
    }
  );

  const plaData$ = state$.delay(0).debounce(10).map(({state}) =>
    toPLA(state.diagram, state.currentKvMode, state.currentCube)
  );

  plaData$.subscribe(plaSubject);

  return {
    DOM: vtree$,
    plaData$,
    preventDefault: actions.preventDefault,
  };
};
