import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({DOM, globalEvents, visible$}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const state$ = model(visible$, actions);
  const modal = isolate(ModalBox)({
    DOM,
    globalEvents,
    props$: state$.map(({props}) => props),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map((e) => div([e])),
    preventDefault: actions.preventDefault,
    data$: actions.open$,
  };
};
