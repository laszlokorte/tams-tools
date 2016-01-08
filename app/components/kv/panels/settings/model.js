import {Observable as O} from 'rx';

export default (initial$, actions) => {
  return O.merge(
    initial$.startWith('function'),
    actions.check$
  ).map((checked) => ({
    view: checked,
  })).shareReplay(1);
};
