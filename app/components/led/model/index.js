import {Observable as O} from 'rx';

const tableIndex = (...bools) => {
  return bools.reduce(
    (prev, on, i) => prev + (on ? Math.pow(2, i) : 0)
  , 0);
};

const toggleSwitch = (state, switchId) => {
  state.switches[switchId].enabled = !state.switches[switchId].enabled;
  return state;
};

const cycleOutput = (state, ledId) => {
  const index = tableIndex(...state.switches.map(({enabled}) => enabled));
  const oldVal = state.leds[ledId].functionTable[index];
  state.leds[ledId].functionTable[index] =
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
  data$.map(({switches, leds}) => {
    return O.merge([
      actions.toggleSwitch$.map((switchIndex) => (state) =>
        toggleSwitch(state, switchIndex)
      ),
      actions.cycleOutput$.map((ledIndex) => (state) =>
        cycleOutput(state, ledIndex)
      ),
      actions.decimalInput$.map((decimal) => (state) =>
        decimaleInput(state, decimal)
      ),
    ]).startWith({
      switches: switches.map((name) => ({
        name,
        enabled: false,
      })),
      leds: leds.map(({shape, values}) => ({
        path: shape,
        functionTable: values,
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
        path: led.path,
        functionTable: led.functionTable,
        enabled: led.functionTable[
          tableIndex(...(data.switches.map(
            ({enabled}) => enabled
          )))
        ],
      })),
    };
  })
;
