import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';

import ModalBox from '../modal';

import model from './model';
import view from './view';
import intent from './intent';
import help from './help';

import {newDiagram, toJSON} from './diagram';

export default (responses) => {
  console.log(toJSON(newDiagram()));

  const {
    DOM,
  } = responses;

  const helpBox = isolate(ModalBox, 'helpBox')({
    DOM,
    props$: O.just({
      visible: true,
    }),
    content$: O.just(help()),
  });

  const state$ = model(O.empty(), intent(DOM));
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
    }
  );

  return {
    DOM: vtree$,
  };
};
