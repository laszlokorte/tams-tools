import {Observable as O} from 'rx';
import I from 'immutable';

import {graph, isGraphEmpty} from '../lib/graph';
import {layoutTree, bounds} from '../lib/layout';

const treeUiState = I.Record({
  graph: graph(),
  scaleX: 1,
  scaleY: 1,
  bounds: bounds(),
}, 'treeUiState');

export default (props$, data$, actions) => {
  const layout$ = data$.map(layoutTree).shareReplay(1);
  return O.combineLatest(
    props$,
    () =>
      layout$.map((layout) => {
        return treeUiState({
          graph: layout.graph,
          scaleX: 70,
          scaleY: 70,
          bounds: !isGraphEmpty(layout.graph) ?
            bounds({
              minX: layout.bounds.minX * 70 - 60,
              maxX: layout.bounds.maxX * 70 + 60,
              minY: layout.bounds.minY * 70 - 60,
              maxY: layout.bounds.maxY * 70 + 60,
            }) : bounds(),
        });
      })
  ).switch();
};
