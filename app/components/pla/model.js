import {Observable as O} from 'rx';

import layoutPLA from './layout';

export default (props$, data$, actions) =>
  O.combineLatest(
    props$,
    (props) =>
      O.combineLatest(
        actions.click$
        .startWith(true)
        .scan((prev) => !prev),
        actions.rotate$
        .startWith(0)
        .scan((prev) => (prev + 1) % 4),
      data$, (active, rotation, data) => ({
        data: {
          circuit: layoutPLA(data),
          rotation,
          inputs: 3,
        },
        active,
        bounds: active ? {
          min: -500,
          max: 500,
        } : {min: -200, max: 500},
      }))
  ).switch()
;
