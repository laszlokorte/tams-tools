import {svg} from '@cycle/dom';

import {gates, wires, clipPaths} from './gates';
import './view.styl';

const render = ({data}) =>
  svg('g',[
    clipPaths(),
    data.circuit.gates.map(({
      type,
      center, rotation, inputCount,
      soderInput,soderOutput, color,
      highlight,
    }) =>
      gates[type]({
        center, rotation, inputCount,
        soderInput, soderOutput, color,
        highlight,
      })
    ),
    data.circuit.wires.map(({
      type,
      from, toX, toY, input, inputCount,
      soderStart, soderEnd,
    }) =>
      wires[type]({
        from, toX, toY, input, inputCount,
        soderStart, soderEnd,
      })
    ),
    data.circuit.labels.map(({text, align, anchor}) =>
      svg('text', {
        x: anchor.x * 10,
        y: anchor.y * 10,
        'text-anchor': align,
        'alignment-baseline': 'middle',
      }, text)
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
