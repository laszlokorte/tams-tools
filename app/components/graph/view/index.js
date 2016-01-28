import {svg} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  svg('g', [
    state.graph.edges.map((e) =>
      svg('line', {
        x1: e.path.fromX,
        y1: e.path.fromY,
        x2: e.path.toX,
        y2: e.path.toY,
        stroke: 'black',
      })
    ).toArray(),

    state.graph.nodes.map((n) =>
      svg('circle', {
        cx: n.x,
        cy: n.y,
        r: n.radius,
        fill: 'black',
      })
    ).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
