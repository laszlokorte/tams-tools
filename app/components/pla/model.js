import {Observable as O} from 'rx';

import layoutPLA from './layout';

export default (props$, data$, actions) =>
  O.combineLatest(
    props$,
    () =>
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
          bounds: {
            minX: layout.bounds.minX * 10,
            maxX: layout.bounds.maxX * 10,
            minY: layout.bounds.minY * 10,
            maxY: layout.bounds.maxY * 10,
          },
        };
      })
  ).switch()
;
