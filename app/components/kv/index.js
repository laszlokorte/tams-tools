import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';

import HelpBox from '../help';
import Spinner from '../spinner';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
  } = responses;

  const helpBox = isolate(HelpBox, 'myHelpBox')({
    DOM,
    props$: O.just({
      visible: true,
      content: 'Foobar',
    }),
  });

  const inputSpinner = isolate(Spinner, 'mySpinner')({
    DOM,
    props$: O.just({
      value: 4,
      min: 0,
      max: 8,
    }),
  });

  const state$ = model(O.empty(), intent(DOM));
  const vtree$ = view(state$, helpBox.DOM, inputSpinner.DOM);

  return {
    DOM: vtree$,
  };
};
