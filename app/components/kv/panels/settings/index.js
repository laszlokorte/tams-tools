import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import ModalBox from '../../../modal';
import view from './view';
import intent from './intent';
import model from './model';

export default ({DOM, globalEvents, visible$, viewSetting$ = O.empty()}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});

  const state$ = model(viewSetting$, actions);
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: visible$.startWith(false).map((visible) => ({visible})),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
    viewSetting$: state$.map((settings) => settings.view),
  };
};
