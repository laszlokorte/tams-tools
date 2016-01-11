import {Observable as O} from 'rx';
import I from 'immutable';
import {sourcePosition, token, tokenType} from './token';

const TOKEN_TYPE_CHAR = tokenType({
  name: 'char',
});

const lexerState = I.Record({
  currentPosition: sourcePosition(),
  currentToken: null,
  accumulator: "",
}, 'lexerState');

const lex = (prevState, character) => {
  return prevState.set('currentToken', token({
    value: character,
    type: TOKEN_TYPE_CHAR,
    position: prevState.currentPosition,
  })).set('currentPosition',
    prevState.currentPosition
    .update('offset', (off) => off + 1)
  );
};

const lexer = (string) =>
  O.fromArray(string.split(""))
    .startWith(lexerState())
    .scan(lex)
    .skip(1)
    .distinctUntilChanged(
      (state) => state.currentToken,
      (a, b) => a === b
    )
    .map((state) => state.currentToken)
;

export default lexer;
