import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({
    DOM, keydown, visible$,
    pla$ = O.empty(), json$ = O.empty(),
}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const state$ = model(pla$, json$, visible$, actions);
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: state$.map((state) => state.props),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: O.just(div(modal.DOM)),
  };
};
