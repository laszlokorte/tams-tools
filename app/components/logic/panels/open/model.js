import {Observable as O} from 'rx';

export default (visible$, actions) => {
  return O.merge([
    visible$.startWith(false),
    actions.open$.map(() => false),
  ])
  .map((visible) => ({visible}))
  .map((props) => ({props}));
};
