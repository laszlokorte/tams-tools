import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import ModalBox from '../../../modal';
import view from './view';

export default ({DOM, keydown, visible$}) => {
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: visible$.startWith(false).map((visible) => ({visible})),
    content$: O.just(view()),
  });

  return {
    DOM: modal.DOM.map((e) => div([e])),
  };
};
