import {Observable as O} from 'rx';

const MAX_EXPRESSIONS = 7;
const MAX_IDENTIFIERS = 8;

const isValid = (output) =>
  output.result !== null &&
  output.result.expressions.size > 0 &&
  output.result.expressions.size <= MAX_EXPRESSIONS &&
  output.result.freeIdentifiers.size <= MAX_IDENTIFIERS
;

const errorMessage = (output) => {
  if (output.result === null) {
    return null;
  }
  if (output.result.expressions.size > MAX_EXPRESSIONS) {
    return `No more than ${
      MAX_EXPRESSIONS
    } expressions are allowed`;
  }
  if (output.result.freeIdentifiers.size > MAX_IDENTIFIERS) {
    return `No more than ${
      MAX_IDENTIFIERS
    } unbound identifiers are allowed.`;
  }

  return null;
};

export default (visible$, expressionFieldOutput$, actions) => {
  return O.merge([
    visible$.startWith(false),
    actions.open$.map(() => false),
    actions.importExpression$.map(() => false),
  ])
  .map((visible) => ({visible}))
  .map((props) =>
    expressionFieldOutput$.map((output) => ({
      props,
      validExpression: isValid(output),
      expressionError: errorMessage(output),
    }))
  ).switch();
};
