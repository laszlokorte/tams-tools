const valToString = (val) => {
  if (val === true) {
    return '1';
  } else if (val === false) {
    return '0';
  } else {
    return '*';
  }
};

export default (state) => {
  return {
    columnGroups: [
      {
        name: 'Inputs',
        columns: state.switches,
      },
      {
        name: 'Outputs',
        columns: state.leds.map(({name}) => ({name})),
      },
    ],

    selectedRow: state.decimal,

    rows: Array.apply(Array, {
      length: Math.pow(2, state.switches.length),
    }).map((_,i) => ({
      values:
        state.switches.map((__, l) => (Math.pow(2, l) & i) ? 1 : 0)
        .concat(state.leds.map((led) => valToString(led.functionTable[i])))
      ,
    })),
  };
};
