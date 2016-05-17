import {div, h1, dl, dt, dd, br} from '@cycle/dom';

const helpItem = (title, body) => [
  dt('.modal-item-titel', title),
  dd('.modal-item-body', body.map((line) => [line, br()])),
];

export default () => div([
  h1('.modal-box-title', 'LED editor'),
  dl([
    helpItem('Input state:', [
      'Enter a decimal number or click on the input LEDs',
      ' to set the input configuration.',
    ]),
    helpItem('Output state:', [
      'Click on the output LEDs to set the according output values.',
      'Hold the alt key while clicking to set a dont-care value.',
    ]),
  ]),
])
;
