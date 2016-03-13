import {Observable as O} from 'rx';
import I from 'immutable';

import bounds from '../../graphics/lib/bounds';
import {graphNode} from '../lib/graph';
import {layoutGraph} from '../lib/layout';

const _position = I.Record({
  x: 0,
  y: 0,
});

const graphUiState = I.Record({
  graph: null,
  bounds: bounds(),
  transientNode: null,
}, 'graphUiState');

const applyModifier = (state, fn) => fn(state);

const tryCreate = (pos, state) =>
  state.set('transientNode', _position(pos))
;

const doCreate = (state) =>
  state.updateIn(['graph', 'nodes'], (nodes) =>
    nodes.push(graphNode({
      label: "new",
      x: state.transientNode.x,
      y: state.transientNode.y,
    })))
;

const stopCreate = (state) =>
  state.set('transientNode', null)
;

export default (props$, graph$, actions) => {
  return graph$.map((graph) =>
    O.merge([
      actions.tryCreate$.map((pos) => (state) => tryCreate(pos, state)),
      actions.doCreate$.map(() => (state) => doCreate(state)),
      actions.stopCreate$.map(() => (state) => stopCreate(state)),
    ])
    .startWith(graphUiState({graph}))
    .scan(applyModifier)
    .map((state) => {
      const layout = layoutGraph(state.graph);
      return state
        .set('graph', layout.graph)
        .set('bounds', layout.bounds);
    })
  ).switch()
  .shareReplay(1);
};
