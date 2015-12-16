import {svg} from '@cycle/dom';

import {gates, Rotation, clipPaths} from './gates';
import './view.styl';

const render = ({options, data, active}) =>
  svg('g',[
    svg('rect', {
      attributes: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        class: 'test-rect' + (active ? ' state-active' : ''),
      },
    }),
    clipPaths(),
    gates.xnor({center: {x: -2, y: 0}, inputCount: 9, rotation: Rotation.EAST}),
    gates.nand({center: {x: -2, y: 1}, inputCount: 9, rotation: Rotation.EAST}),
    gates.nor({center: {x: -2, y: 2}, inputCount: 9, rotation: Rotation.EAST}),
    gates.negator({center: {x: -2, y: 3}, inputCount: 1, rotation: Rotation.EAST}),

    gates.xor({center: {x: 0, y: 0}, inputCount: 9, rotation: Rotation.EAST}),
    gates.and({center: {x: 0, y: 1}, inputCount: 9, rotation: Rotation.EAST}),
    gates.or({center: {x: 0, y: 2}, inputCount: 9, rotation: Rotation.EAST}),
    gates.buffer({center: {x: 0, y: 3}, inputCount: 1, rotation: Rotation.EAST}),
  ])
;

export default (state$) =>
  state$.map(render)
;
