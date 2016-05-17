import {div, h1, h2, dl, dt, dd, br} from '@cycle/dom';

const helpItem = (title, body) => [
  dt('.modal-item-titel', title),
  dd('.modal-item-body', body.map((line) => [line, br()])),
];

export default () => div([
  h1('.modal-box-title', 'Karnaugh map editor'),
  h2('Edit function'),
  dl([
    helpItem('Change Size:', [
      'You can change the number of inputs.',
      'This will change the KV-diagrams\'s dimensions.',
    ]),
    helpItem('Outputs:', [
      'You can add up to 7 outputs',
      'An outputs can be renamed by clicking it\'s name',
    ]),
    helpItem('Change Values:', [
      'Click on the table cells to cycle the value.',
      '(hold ALT key for reversed cycle direction)',
    ]),
  ]),
  h2('Edit loops'),
  dl([
    helpItem('Loop Mode:', [
      'You can switch between DNF and KNF mode',
      'DNF Loops must not contain "0" cells',
      'KNF Loops must not contain "1" cells',
    ]),
    helpItem('Create loops:', [
      'Drag between two cells to create a loop.',
    ]),
    helpItem('Remove loops:', [
      'Click on a loop icon to delete the loop.',
    ]),
  ]),
])
;
