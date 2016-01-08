import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import view from './view';
import intent from './intent';
import model from './model';

export default ({DOM, keydown, visible$, viewSetting$ = O.empty()}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});

  const state$ = model(viewSetting$, actions);
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: visible$.startWith(false).map((visible) => ({visible})),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: O.just(div(modal.DOM)),
    viewSetting$: state$.map((settings) => settings.view),
  };
};
