import {svg} from '@cycle/dom';

import {gates, wires, clipPaths} from './gates';
import './index.styl';

const render = ({data}) =>
  svg('g',[
    clipPaths(3000),
    data.circuit.gates.map(({
      type,
      center, rotation, inputCount,
      soderInput,soderOutput, color,
      highlight, mayOmit,
    }, key) =>
      gates[type]({
        key,
        center, rotation, inputCount,
        soderInput, soderOutput, color,
        highlight, mayOmit,
      })
    ),
    data.circuit.wires.map(({
      type,
      from, toX, toY, input, inputCount,
      soderStart, soderEnd,
    }, key) =>
      wires[type]({
        key,
        from, toX, toY, input, inputCount,
        soderStart, soderEnd,
      })
    ),
    data.circuit.labels.map(({text, align, anchor}) =>
      svg('text', {
        key: 'label-' + text,
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
