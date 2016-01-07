import {Observable as O} from 'rx';

import layoutPLA from '../lib/layout';

export default (props$, data$, actions) => {
  const layout$ = data$.map(layoutPLA).shareReplay(1);
  return O.combineLatest(
    props$,
    () =>
      O.combineLatest(
        actions.click$
        .startWith(true)
        .scan((prev) => !prev),
      layout$, (active, layout) => {
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
  ).switch();
};
