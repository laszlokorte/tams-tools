import {Observable as O} from 'rx';

// convert numbert into bit pattern string of length
// bitCount.
const bitPattern = (number, bitCount) =>
  Array
    .apply(Array, {length: bitCount})
    .map((__, b) =>
      (1 << (bitCount - b - 1)) & number ? 1 : 0
    ).join('')
;

const intValue = (number, bitCountPow2) =>
  number >= bitCountPow2 / 2 ? number - bitCountPow2 : number
;

// generate array of angles for a number circle of
// given bitCount.
const dotArray = (bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, {length}) => ({
    angle: 2 * Math.PI * index / length,
    value: intValue(index, length),
    pattern: bitPattern(index, bitCount),
  }))
;

const overflowAngle = (dots) =>
  (
  dots[
    Math.floor((dots.length - 1) / 2)
  ].angle +
  dots[
    Math.ceil((dots.length - 1) / 2)
  ].angle
  ) / 2
;

export default (bitCount$, actions) => {
  const modifierFunction$ = O.merge([
    actions.selectBit$.map((bitIndex) => (state) =>
      ({bitCount: state.bitCount, selected: bitIndex})
    ),
  ]);

  return bitCount$.map((bitCount) =>
    modifierFunction$
    // number of bits to generate the number circle for
    .startWith({selected: null})
    // apply the function
    .scan((state, modifierFunction) => modifierFunction(state))
    // convert number of bit's into array of angles
    .map(({selected}) => {
      const dots = dotArray(bitCount);
      const dotRadius = 50;
      const circumference = dotRadius * 4 * Math.max(7, dots.length);
      const radius = circumference / 2 / Math.PI;
      const sizeHalf = (radius + dotRadius) + 100 * Math.max(2, bitCount);

      return {
        // number of bits
        bitCount,
        // the dots to draw
        dots,
        // the index of the selected dot
        selected,

        dotRadius,

        radius,

        overflowAngle: overflowAngle(dots),

        bounds: {
          minX: -sizeHalf,
          minY: -sizeHalf,
          maxX: sizeHalf,
          maxY: sizeHalf,
        },
      };
    })
  ).switch();
};
