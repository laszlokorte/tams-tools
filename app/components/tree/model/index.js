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

export default (props$, data$/*, actions*/) => {
  const layout$ = data$.map(layoutTree).shareReplay(1);
  return O.combineLatest(
    props$,
    (props) =>
      layout$.map((layout) => {
        return treeUiState({
          graph: layout.graph,
          scaleX: props.scaleX,
          scaleY: props.scaleX,
          bounds: !isGraphEmpty(layout.graph) ?
            bounds({
              minX: (layout.bounds.minX - 0.5) * props.scaleX,
              maxX: (layout.bounds.maxX + 0.5) * props.scaleX,
              minY: (layout.bounds.minY - 0.5) * props.scaleX,
              maxY: (layout.bounds.maxY + 0.5) * props.scaleX,
            }) : bounds(),
        });
      })
  ).switch();
};
