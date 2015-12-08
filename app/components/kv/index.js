import './index.styl';

import {Observable as O} from 'rx';
//import isolate from '@cycle/isolate';
import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    //Storage
  } = responses;

  const vtree$ = view(model(O.empty(), intent(DOM)));

  return {
    DOM: vtree$,
  };
};
