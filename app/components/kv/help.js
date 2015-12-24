import {div, h1, dl, dt, dd} from '@cycle/dom';

const helpItem = (title, body) => [
  dt('.modal-item-titel', title),
  dd('.modal-item-body', body),
];

export default () => div([
  h1('Karnaugh-Veitch-Diagram Editor'),
  dl([
    helpItem('Change Size:', [
      'You can change the amount of inputs.',
      'This will change the KV-diagrams\'s dimensions.',
    ]),
    helpItem('Change Values:', [
      'Click on the table cells to cycle the value.',
      '(hold ALT key for reversed cycle direction)',
    ]),
    helpItem('Create loops:', [
      'Drag between two cells while holding SHIFT to create a loop.',
    ]),
    helpItem('Remove loops:', [
      'Click on a loop icon to delete the loop.',
    ]),
  ]),
])
;
