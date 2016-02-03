import I from 'immutable';

export const _simulationTick = I.Record({
  inputValues: I.List(),
  outputValues: I.List(),
}, 'simulationTick');

export const _simulation = I.Record({
  ticks: I.List(),
}, 'simulation');

export const newSimulation = () => {
  return _simulation();
};

export const reset = (simulation) =>
  simulation.update('ticks',
    (ticks) => ticks.clear()
  )
;
