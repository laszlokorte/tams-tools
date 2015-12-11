import {Observable as O} from 'rx';

export default (enabled$, actions) =>
  O.merge(
    enabled$,
    actions.change$
  ).map((enabled) => ({
    enabled,
  }))
;
