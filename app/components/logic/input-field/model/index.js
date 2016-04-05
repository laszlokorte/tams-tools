import {Observable as O} from 'rx';
import I from 'immutable';

import {
  CBitwise, CBoolean, Python, Latex, Math,
} from './languages';

import parser from './parser';
import {postProcess} from './post-processor';

import {
  input as _input,
  output as _output,
  error as _error,
} from './io';

// a mapping from languageId to language object
const LANGUAGE_MAP = {
  c_bitwise: CBitwise,
  c_boolean: CBoolean,
  latex: Latex,
  math: Math,
  python: Python,
};

const _state = I.Record({
  languageList: I.List(), // the list of all available languages
  input: null, // the current input
  output: null, // the current ouput
  showCompletion: true, // if buttons for inserting special tokens are visible
}, 'state');

// a list of languages with their corrsponding id
const languageList = I.List(Object
  .keys(LANGUAGE_MAP)
  .map((id) => ({
    id: id,
    language: LANGUAGE_MAP[id],
  })));

// function to recover the parser pipeline from a parse error
const handleError = (parseError) =>
  O.just(_output({
    network: null,
    language: parseError.language,
    error: _error({
      location: parseError.location,
      message: parseError.message,
    }),
  }))
;

// parse and analyze the given input object
// returns a stream containing an output object
const processInput = (input) => {
  return O.just(input)
  .map(parser(LANGUAGE_MAP))
  .map(postProcess)
  .map((analysisResult) => _output({
    language: analysisResult.language,
    network: analysisResult.network,
    error: analysisResult.error,
  }))
  .catch(handleError);
};

export default (props$, initalExpression$, actions) =>
  initalExpression$
  .startWith({term: '', langId: 'auto'})
  .map((initial) =>
    O.combineLatest(
      O.combineLatest(
        actions.input$.startWith(initial.term),
        actions.language$.startWith(initial.langId),
        (term, langId) => _input({string: term, langId})
      ),
      props$,
      (input, props) =>
        processInput(input)
        .map((output) =>
          _state({
            input,
            output: output,
            languageList,
            showCompletion: props.showCompletion,
          })
        )
    ).switch()
  ).switch()
  .shareReplay(1)
;
