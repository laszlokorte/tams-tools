import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

const defaultProps = {
  label: 'Radio',
  options: [
    {label: 'A', value: 'a'},
    {label: 'B', value: 'b'},
  ],
};

export default (responses) => {
  const {
    DOM,
    props$,
    value$,
  } = responses;

  const state$ = model(props$.startWith(defaultProps), value$, intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    value$: state$.map(pluck('value')),
  };
};
