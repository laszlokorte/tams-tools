import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({
    DOM, keydown, visible$,
    table$ = O.empty(),
    formula$ = O.empty(),
}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const state$ = model(table$, formula$, actions).shareReplay(1);
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: visible$.map((visible) => ({visible})),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map((e) => div([e])),
    selectAll: actions.selectAll$,
  };
};
