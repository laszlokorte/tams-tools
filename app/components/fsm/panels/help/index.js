import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import ModalBox from '../../../modal';
import view from './view';

export default ({DOM, globalEvents, visible$}) => {
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: visible$.startWith(false).map((visible) => ({visible})),
    content$: O.just(view()),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
  };
};
