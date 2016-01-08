import {div, strong} from '@cycle/dom';
import calcCosts from '../lib/costs';

export default (pla) => {
  const costs = calcCosts(pla);
  return div('.stage-bar', [
    strong('Costs:'),
    ` ${costs.gates} gates with ${costs.inputs} inputs`,
  ]);
};
