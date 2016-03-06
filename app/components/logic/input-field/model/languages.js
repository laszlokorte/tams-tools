import I from 'immutable';

import cParser from '../../lib/syntax/logic-c.pegjs';
import latexParser from '../../lib/syntax/logic-latex.pegjs';
import mathParser from '../../lib/syntax/logic-math.pegjs';
import pythonParser from '../../lib/syntax/logic-python.pegjs';

const language = I.Record({
  name: null,
  completions: I.List(),
  parse: () => { throw new Error("not implemented"); },
});

export const C = language({
  name: 'C',
  completions: I.List([
    '&','|','^','~',
    '1','0', 'void',
  ]),
  parse: (string) => cParser.parse(string),
});

export const Python = language({
  name: 'Python',
  completions: I.List([
    'and','or','xor','not',
    'True','False', 'None',
  ]),
  parse: (string) => pythonParser.parse(string),
});

export const Latex = language({
  name: 'Latex',
  completions: I.List([
    '\\wedge','\\vee','\\oplus','\\neg',
    '\\top','\\bot', '\\nothing',
  ]),
  parse: (string) => latexParser.parse(string),
});

export const Math = language({
  name: 'Math',
  completions: I.List([
    '∧','∨','⊕','¬',
    '⊤','⊥', 'Ø',
  ]),
  parse: (string) => mathParser.parse(string),
});
