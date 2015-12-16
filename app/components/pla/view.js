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
    gates.xnor({center: {x: -20, y: -30}, inputCount: 9,
      rotation: data.rotation}),
    gates.nand({center: {x: -20, y: -15}, inputCount: 9,
      rotation: data.rotation}),
    gates.nor({center: {x: -20, y: 0}, inputCount: 9,
      rotation: data.rotation}),
    gates.negator({center: {x: -20, y: 15}, inputCount: 1,
      rotation: data.rotation}),

    gates.xor({center: {x: 0, y: -30}, inputCount: 9,
      rotation: data.rotation}),
    gates.and({center: {x: 0, y: -15}, inputCount: 9,
      rotation: data.rotation}),
    gates.or({center: {x: 0, y: 0}, inputCount: 9,
      rotation: data.rotation}),
    gates.buffer({center: {x: 0, y: 15}, inputCount: 1,
      rotation: data.rotation}),
  ])
;

export default (state$) =>
  state$.map(render)
;
