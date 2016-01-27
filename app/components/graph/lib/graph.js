import I from 'immutable';

export const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
}, 'graphNode');

export const graphEdge = I.Record({
  label: null,
  fromIndex: null,
  toIndex: null,
}, 'graphEdge');

export const _graph = I.Record({
  nodes: I.List(),
  edges: I.List(),
}, 'graph');

export const graphFromJson = () => {
  return _graph();
};
