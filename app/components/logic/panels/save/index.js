import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({
    DOM, globalEvents, visible$,
    table$ = O.empty(),
    formula$ = O.empty(),
    tree$ = O.empty(),
}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const state$ = model(table$, formula$, tree$, actions);
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: visible$.map((visible) => ({visible})),
    content$: isolateSink(view(state$), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
    selectAll: actions.selectAll$,
  };
};
