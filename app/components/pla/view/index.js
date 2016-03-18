import {svg} from '@cycle/dom';

import {gates, wires, clipPaths} from './gates';
import './index.styl';

// generate an svg tree displaying the gates and wires of
// a given pla
const renderCircuit = (circuit) =>
  svg('g',[
    // max width of a gate. 3000 should be enough
    // input ports of larger gates get clipped
    clipPaths(3000),

    // create gate shapes
    circuit.gates.map(({
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
    ).toArray(),

    // create wire shapes
    circuit.wires.map(({
      type,
      from, toX, toY, input, inputCount,
      soderStart, soderEnd,
    }, key) =>
      wires[type]({
        key,
        from, toX, toY, input, inputCount,
        soderStart, soderEnd,
      })
    ).toArray(),

    // create text labels
    circuit.labels.map(({text, align, anchor}, i) =>
      svg('text', {
        key: 'label-' + i,
        x: anchor.x * 10,
        y: anchor.y * 10,
        'text-anchor': align,
        'alignment-baseline': 'middle',
      }, text)
    ).toArray(),
  ])
;

const render = (state) =>
  renderCircuit(state.circuit)
;

export default (state$) =>
  state$.map(render)
;
