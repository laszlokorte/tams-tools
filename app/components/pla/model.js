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
      data$, (active, data) => {
        const layout = layoutPLA(data);
        return {
          data: {
            circuit: layout,
            inputs: 3,
          },
          active,
          bounds: active ? {
            min: -500,
            max: 500,
          } : {
            min: layout.bounds.min * 10,
            max: layout.bounds.max * 10,
          },
        };
      })
  ).switch()
;
