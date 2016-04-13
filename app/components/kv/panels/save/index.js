import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({
    DOM, globalEvents, visible$,
    pla$ = O.empty(), json$ = O.empty(),
}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const state$ = model(pla$, json$);
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: O.merge([
      actions.finish$.map(() => false),
      visible$,
    ]).map((v) => ({visible: v})),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
    selectAll: actions.selectAll$,
  };
};
