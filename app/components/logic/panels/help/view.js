import {div, h1, h2, dl, dt, dd, br} from '@cycle/dom';

const helpItem = (title, body) => [
  dt('.modal-item-titel', title),
  dd('.modal-item-body', body.map((line) => [line, br()])),
];

export default () => div([
  h1('.modal-box-title', 'Logic Expression Editor'),
  h2('Languages'),
  dl([
    helpItem('Auto detection:', [
      'If the language is set to auto detect a dialect of the logic expression will be guessed.',
    ]),
    helpItem('C', [
      'Literals: 1, 0, true, false, W, T, F',
      'Binary Operators: &&, &, ||, |, ^',
      'Unary Operators: !, ~',
      'Identifiers can be quoted',
    ]),
    helpItem('Python', [
      'Literals: 1, 0, true, false, W, T, F',
      'Binary Operators: and, or, xor',
      'Unary Operators: not',
      'Identifiers can be quoted',
    ]),
    helpItem('Math', [
      'Literals: 1, 0, true, false, W, T, F',
      'Binary Operators: &&, &, ||, |, ^, +, *',
      'Unary Operators: !, ~, -',
      'Identifiers can be quoted',
      'adjacent get ANDed automatically',
    ]),
    helpItem('Latex', [
      'Literals: 1, 0, true, false, W, T, F, \\top, \\bot',
      'Binary Operators: &&, &, ||, |, ^, +, *, \\oplus, \\vee, \\wedge',
      'Unary Operators: !, ~, -, \\neg, \\overline',
      'Identifiers can be quoted',
      'adjacent get ANDed automatically',
    ]),
  ]),
  h2('Truth table'),
  dl([
    helpItem('Select row', [
      'Select a row in the table to color the expression tree accordingly.',
    ]),
  ]),
])
;
