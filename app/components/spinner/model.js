import {Observable as O} from 'rx';

import {clamp} from '../../lib/utils';

export default (value$, props$, actions) =>
  O.combineLatest(
    value$,
    props$,
    (val, {min, max, label}) =>
      O.merge(
        actions.increment$.map(() => 1),
        actions.decrement$.map(() => -1)
      )
      .scan((prev, delta) =>
        clamp(prev + delta, min, max), val
      )
      .startWith(val).map((value) => ({
        value,
        canDecrement: value > min,
        canIncrement: value < max,
        label: label,
      })
    )
  ).switch()
;
