import I from 'immutable';

export const sourcePosition = I.Record({
  line: 0,
  column: 0,
  offset: 0,
}, 'SourcePosition');

sourcePosition.prototype.toString = function sourcePositiontoString() {
  return `Pos(${this.line},line:${this.column},col:${this.offset}`;
};

export const tokenType = I.Record({
  name: "unknown",
}, 'Token');

export const TOKEN_TYPE_UNKNOWN = tokenType();

export const token = I.Record({
  type: TOKEN_TYPE_UNKNOWN,
  position: sourcePosition(),
  value: '',
}, 'Token');

token.prototype.toString = function sourcePositiontoString() {
  return `"${this.value}" [${this.type}] @${this.position.toString()}`;
};
