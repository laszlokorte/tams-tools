import {Observable as O} from 'rx';

export default (props$, data$, actions) =>
  O.combineLatest(
    props$,
    data$,
    (props, data) =>
      actions.click$
      .startWith(true)
      .scan((prev) => !prev)
      .map((active) => ({
        data,
        active,
        bounds: active ? {
          min: -500,
          max: 500,
        } : {min: -200, max: 500},
      }))
  ).switch()
;
