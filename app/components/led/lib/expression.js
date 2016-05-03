import formatter from '../../logic/lib/formatter/c-bitwise';

export default (state) => {
  return formatter.formatExpressions(state.leds.map((led) =>
    formatter.formatLabel(
      led.name,
      formatter.formatVector(state.switches, led.functionTable)
    )
  ));
};
