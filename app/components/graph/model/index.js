import I from 'immutable';

import bounds from '../../graphics/lib/bounds';
import {layoutGraph} from '../lib/layout';

const graphUiState = I.Record({
  graph: null,
  bounds: bounds(),
}, 'treeUiState');

export default (props$, graph$) => {
  return graph$.map((graph) =>
    graphUiState(layoutGraph(graph))
  );
};
