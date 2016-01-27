import {Observable as O} from 'rx';
import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

const graphUiState = I.Record({
  graph: null,
  bounds: bounds(),
}, 'treeUiState');

export default (props$, $graph, actions) => {
  return O.just(graphUiState());
};
