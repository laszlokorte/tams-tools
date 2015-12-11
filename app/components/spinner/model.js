import {Observable as O} from 'rx';

import {clamp} from '../../lib/utils';

export default (value$, min$, max$, actions) =>
  O.combineLatest(
    value$,
    min$,
    max$,
    (val, min, max) =>
      O.merge(
        actions.increment$.map(() => 1),
        actions.decrement$.map(() => -1)
      )
      .scan((prev, delta) =>
        clamp(prev + delta, min, max), val
      )
      .startWith(val).map((value) => ({
        value,
        canIncrement: value < min,
        canDecrement: value > max,
      })
    )
  ).switch()
;
