import {Observable as O} from 'rx';
import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

import layoutPLA from '../lib/layout';
import {pla} from '../lib/pla';

const plaUiState = I.Record({
  circuit: pla(),
  bounds: bounds(),
}, 'treeUiState');

export default (props$, data$/*, actions*/) => {
  const layout$ = data$
    .map(layoutPLA)
    .shareReplay(1);

  return O.combineLatest(
    props$,
    () =>
      layout$.map((layout) => {
        return plaUiState({
          circuit: layout,
          bounds: bounds({
            minX: layout.bounds.minX * 10,
            maxX: layout.bounds.maxX * 10,
            minY: layout.bounds.minY * 10,
            maxY: layout.bounds.maxY * 10,
          }),
        });
      })
  )
  .switch()
  .shareReplay(1);
};
