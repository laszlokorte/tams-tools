import {Observable as O} from 'rx';

import templates from './templates';

// convert a list of bools into a number
const tableIndex = (bools) => {
  return bools.reduce(
    (prev, on, i) => prev + (on ? 1 << i : 0)
  , 0);
};

// toggle the switch the given index
const toggleSwitch = (swichIndex, state) => {
  state.switches[swichIndex].enabled = !state.switches[swichIndex].enabled;
  return state;
};

// toggle the ouput of the given index
// if reset is true the output is set to null (dont-care)
const toggleOutput = (outputIndex, reset, state) => {
  const index = tableIndex(state.switches.map(({enabled}) => enabled));
  const oldVal = state.leds[outputIndex].functionTable[index];

  state.leds[outputIndex].functionTable[index] = reset ? null :
    !oldVal;

  return state;
};

// set the input switch values to match the binary
// pattern of the given decimal number
const decimaleInput = (decimal, state) => {
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
        toggleSwitch(switchIndex, state)
      ),
      actions.toggleOutput$.map(({outputIndex, reset}) => (state) =>
        toggleOutput(outputIndex, reset, state)
      ),
      actions.decimalInput$.map((decimal) => (state) =>
        decimaleInput(decimal, state)
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
      // the names and values of the input switches
      switches: data.switches,
      // the current input values interpreted as decimal number
      decimal: tableIndex(data.switches.map(
        ({enabled}) => enabled
      )),
      // the output leds
      leds: data.leds.map((led) => ({
        name: led.name, // nam of the led
        labelPosition: led.labelPosition, // position of the leds label text
        shape: led.shape, // shape of the led
        functionTable: led.functionTable, // function table for this output
        enabled: led.functionTable[ // if the led is on or off
          tableIndex(data.switches.map(
            ({enabled}) => enabled
          ))
        ],
      })),
    };
  })
  .shareReplay(1)
;
