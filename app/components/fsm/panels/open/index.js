import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({DOM, globalEvents, visible$}) => {
  const {isolateSource, isolateSink} = DOM;
  const isolatedDOM = isolateSource(DOM, 'modalBody');

  const actions = intent({
    DOM: isolatedDOM,
  });
  const state$ = model(visible$, actions);
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: state$.map(({props}) => props),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
    preventDefault: O.merge([
      actions.preventDefault,
    ]),
    data$: actions.open$,
  };
};
