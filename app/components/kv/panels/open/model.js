import {Observable as O} from 'rx';

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
      validExpression: output.result !== null &&
      output.result.expressions.size > 0 &&
      output.result.expressions.size <= 7 &&
      output.result.freeIdentifiers.size <= 8,
    }))
  ).switch();
};
