import {div, h1, h2, dl, dt, dd, br} from '@cycle/dom';

const helpItem = (title, body) => [
  dt('.modal-item-titel', title),
  dd('.modal-item-body', body.map((line) => [line, br()])),
];

export default () => div([
  h1('.modal-box-title', 'Finale State Machine Editor'),
  h2('Machine Type'),
  dl([
    helpItem('Moore:', [
      '...',
    ]),
    helpItem('Mealy:', [
      '...',
    ]),
  ]),
  h2('Edit'),
  dl([
    helpItem('Edit states:', [
      'In the panel on the right side a state graph can be constructed.',
    ]),
  ]),
  h2('Simulate'),
  dl([
    helpItem('foo', [
      'bar',
    ]),
  ]),
])
;
