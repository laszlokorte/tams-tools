import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';

import ModalBox from '../modal';

import model from './model';
import view from './view';
import intent from './intent';
import help from './help';
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
    content$: O.just(help()),
    keydown,
  });

  const state$ = model(O.empty(), actions).shareReplay(1);
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
    }
  );

  const plaData$ = state$.delay(0).debounce(10).map(({state}) =>
    toPLA(state.diagram, state.currentMode, state.currentCube)
  ).share();

  return {
    DOM: vtree$,
    plaData$,
    preventDefault: actions.preventDefault,
  };
};
