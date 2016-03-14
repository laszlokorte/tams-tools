import {Observable as O} from 'rx';

const MAX_EXPRESSIONS = 7;
const MAX_IDENTIFIERS = 8;

const isValid = (network) =>
  network !== null &&
  network.expressions.size > 0 &&
  network.expressions.size <= MAX_EXPRESSIONS &&
  network.freeIdentifiers.size <= MAX_IDENTIFIERS
;

const errorMessage = (output) => {
  if (output.network === null) {
    return null;
  }
  if (output.network.expressions.size > MAX_EXPRESSIONS) {
    return `No more than ${
      MAX_EXPRESSIONS
    } expressions are allowed`;
  }
  if (output.network.freeIdentifiers.size > MAX_IDENTIFIERS) {
    return `No more than ${
      MAX_IDENTIFIERS
    } unbound identifiers are allowed.`;
  }

  return null;
};

export default (visible$, expressionFieldOutput$, actions) =>
  O.merge([
    visible$.startWith(false),
    actions.open$.map(() => false),
    actions.importExpression$.map(() => false),
  ])
  .map((visible) => ({visible}))
  .map((props) =>
    expressionFieldOutput$.map((output) => ({
      props,
      validExpression: isValid(output.network),
      expressionError: errorMessage(output),
    }))
  ).switch()
  .shareReplay(1);
;
