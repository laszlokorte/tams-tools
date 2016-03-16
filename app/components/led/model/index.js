import {Observable as O} from 'rx';

import templates from './templates';

const tableIndex = (...bools) => {
  return bools.reduce(
    (prev, on, i) => prev + (on ? Math.pow(2, i) : 0)
  , 0);
};

const toggleSwitch = (state, switchId) => {
  state.switches[switchId].enabled = !state.switches[switchId].enabled;
  return state;
};

const toggleOutput = (state, outputIndex, reset) => {
  const index = tableIndex(...state.switches.map(({enabled}) => enabled));
  const oldVal = state.leds[outputIndex].functionTable[index];

  state.leds[outputIndex].functionTable[index] = reset ? null :
    !oldVal;

  return state;
};

const decimaleInput = (state, decimal) => {
  state.switches = state.switches.map((s, i) =>
    ({
      name: s.name,
      enabled: !!(Math.pow(2, i) & decimal),
    })
  );

  return state;
};

export default (data$, actions) =>
  data$
  .startWith(templates[0])
  .map((template) => {
    return O.merge([
      actions.toggleSwitch$.map((switchIndex) => (state) =>
        toggleSwitch(state, switchIndex)
      ),
      actions.toggleOutput$.map(({outputIndex, reset}) => (state) =>
        toggleOutput(state, outputIndex, reset)
      ),
      actions.decimalInput$.map((decimal) => (state) =>
        decimaleInput(state, decimal)
      ),
    ]).startWith({
      switches: template.inputs.map((name) => ({
        name,
        enabled: false,
      })),
      leds: template.segments.map(({name, shape, labelPosition}, idx) => ({
        name,
        labelPosition,
        shape,
        functionTable: template.outputs[idx],
      })),
    })
    .scan((prev, fn) => fn(prev));
  })
  .switch()
  .map((data) => {
    return {
      switches: data.switches,
      decimal: tableIndex(...(data.switches.map(
        ({enabled}) => enabled
      ))),
      leds: data.leds.map((led) => ({
        name: led.name,
        labelPosition: led.labelPosition,
        shape: led.shape,
        functionTable: led.functionTable,
        enabled: led.functionTable[
          tableIndex(...(data.switches.map(
            ({enabled}) => enabled
          )))
        ],
      })),
    };
  })
  .shareReplay(1)
;
