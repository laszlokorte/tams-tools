import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';

export default ({DOM, keydown, visible$}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent({DOM: isolateSource(DOM, 'modalBody')});
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: O.merge(
      visible$.startWith(false).map((visible) => ({visible})),
      actions.open$.map(() => false)
    ),
    content$: isolateSink(O.just(view()), 'modalBody'),
  });

  return {
    DOM: O.just(div(modal.DOM)),
    preventDefault: actions.preventDefault,
    data$: actions.open$,
  };
};
