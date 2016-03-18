import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

// initialize the modal window component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.just({
    visible: false, // if the modal should be open/visible
  }),
  content$, // virtual dom tree to display inside the modal window
}) => {
  const visible$ = props$
    .map(pluck('visible'));

  const actions = intent(DOM, globalEvents);
  const state$ = model(visible$, content$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    visible$: state$.map(pluck('visible')),
    preventDefault: actions.preventDefault,
  };
};
