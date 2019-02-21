import I from 'immutable';

import cBitwiseParser from '../../lib/syntax/logic-c-bitwise.pegjs';
import cBooleanParser from '../../lib/syntax/logic-c-boolean.pegjs';
import latexParser from '../../lib/syntax/logic-latex.pegjs';
import mathParser from '../../lib/syntax/logic-math.pegjs';
import pythonParser from '../../lib/syntax/logic-python.pegjs';

// an object representing a language that can be used for parsing
// a expression given as string
const language = I.Record({
  // the name of the language
  name: null,
  // short name used for finding correct formatter,
  shortName: null,
  // important tokens used in the language
  // which a user might not be able to type
  // on the keyboard
  completions: I.List(),
  // function from json to plain ast
  parse: (/*string*/) => { throw new Error("not implemented"); },
});

export const CBitwise = language({
  name: 'C - Bitwise',
  shortName: 'cbitwise',
  completions: I.List([
    '&','|','^','~',
    '1','0', 'void',
  ]),
  parse: (string) => cBitwiseParser.parse(string),
});

export const CBoolean = language({
  name: 'C - Boolean',
  shortName: 'cboolean',
  completions: I.List([
    '&&','||','!=','!',
    'true','false', 'void',
  ]),
  parse: (string) => cBooleanParser.parse(string),
});

export const Python = language({
  name: 'Python',
  shortName: 'python',
  completions: I.List([
    'and','or','xor','not',
    'True','False', 'None',
  ]),
  parse: (string) => pythonParser.parse(string),
});

export const Latex = language({
  name: 'Latex',
  shortName: 'latex',
  completions: I.List([
    '\\wedge','\\vee','\\oplus','\\neg',
    '\\top','\\bot', '\\nothing',
  ]),
  parse: (string) => latexParser.parse(string),
});

export const Math = language({
  name: 'Math',
  shortName: 'math',
  completions: I.List([
    '∧','∨','⊕','¬',
    '⊤','⊥', 'Ø',
  ]),
  parse: (string) => mathParser.parse(string),
});
