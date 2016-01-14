import {Observable as O} from 'rx';

import layoutTree from '../lib/layout';

export default (props$, data$, actions) => {
  const layout$ = data$.map(layoutTree).shareReplay(1);
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
            nodes: layout.nodes,
            edges: layout.edges,
            scaleX: 50,
            scaleY: 70,
          },
          active,
          bounds: {
            minX: layout.bounds.minX * 50 - 60,
            maxX: layout.bounds.maxX * 50 + 60,
            minY: layout.bounds.minY * 70 - 60,
            maxY: layout.bounds.maxY * 70 + 60,
          },
        };
      })
  ).switch();
};
