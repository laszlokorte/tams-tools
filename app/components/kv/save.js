import {div, h1, h3, textarea} from '@cycle/dom';

const formatPLA = (pla) => {
  return [
    `.i ${pla.inputs.length}`,
    `.innames ${pla.inputs.join(' ')}`,
    `.o ${pla.outputs.length}`,
    `.outnames ${pla.outputs.join(' ')}`,
    `.p${pla.loops.length}`,
    pla.loops.map((loop) =>
      loop.in.concat(loop.out).map((v) => {
        if (v === 1 || v === 0) {
          return v;
        } else {
          return '*';
        }
      }).join(' ')
    ).join('\n'),
    `.e`,
  ].join('\n');
};

export default (pla$) => div([
  h1('.modal-box-title', 'Export...'),
  h3('PLA'),
  div(pla$
    .map(formatPLA)
    .startWith('')
    .map((text) => textarea('.export-text', {
      attributes: {readonly: true},
    }, text))),
])
;
