import {svg} from '@cycle/dom';

import {gates, wires, Rotation, clipPaths} from './gates';
import './view.styl';

const render = ({options, data, active}) =>
  svg('g',[
    clipPaths(),
    data.circuit.gates.map(({type, center, rotation, inputCount, soderInput, soderOutput, color}) =>
      gates[type]({center, rotation, inputCount, soderInput, soderOutput, color})
    ),
    data.circuit.wires.map(({type, from, toX, toY, input, inputCount, soderStart, soderEnd}) =>
      wires[type]({from, toX, toY, input, inputCount, soderStart, soderEnd})
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
