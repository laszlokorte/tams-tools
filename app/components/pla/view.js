import {svg} from '@cycle/dom';

import {gates, wires, Rotation, clipPaths} from './gates';
import './view.styl';

const render = ({options, data, active}) =>
  svg('g',[
    clipPaths(),
    data.circuit.gates.map(({type, center, rotation, inputCount, soderInput, soderOutput}) =>
      gates[type]({center, rotation, inputCount, soderInput, soderOutput})
    ),
    data.circuit.wires.map(({type, from, toX, toY, input, inputCount, soderStart, soderEnd}) =>
      wires[type]({from, toX, toY, input, inputCount, soderStart, soderEnd})
    ),
    // gates.xnor({center: {x: -20, y: -30}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.nand({center: {x: -20, y: -15}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.nor({center: {x: -20, y: 0}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.negator({center: {x: -20, y: 15}, inputCount: data.inputs,
    //   rotation: data.rotation}),

    // gates.xor({center: {x: 0, y: -30}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.and({center: {x: 0, y: -15}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.or({center: {x: 0, y: 0}, inputCount: data.inputs,
    //   rotation: data.rotation}),
    // gates.buffer({center: {x: 0, y: 15}, inputCount: data.inputs,
    //   rotation: data.rotation}),
  ])
;

export default (state$) =>
  state$.map(render)
;
