import {Observable as O} from 'rx';

const ENCODINGS = {
  positive: {
    formatter: (pattern) => {
      return parseInt(pattern, 2);
    },
    overflowAngle: (dots) => {
      return 2 * Math.PI - (
        dots[0].angle +
        dots[1].angle
      ) / 2;
    },
    baseIndex: () => 0,
  },

  signed: {
    formatter: (pattern) => {
      const sign = pattern.substr(0,1) === '1' ?
        '-' : '';
      return sign + parseInt(pattern.substr(1), 2).toString(10);
    },
    overflowAngle: (dots) => {
      return 2 * Math.PI - (
        dots[0].angle +
        dots[1].angle
      ) / 2;
    },
    baseIndex: (pattern) => {
      if (pattern.substr(0, 1) === '1') {
        return Math.pow(2, pattern.length - 1);
      } else {
        return 0;
      }
    },
  },

  complement1: {
    formatter: (pattern) => {
      const offset = pattern.substr(0,1) === '1' ?
        -Math.pow(2, pattern.length - 1) + 1 : 0;
      return offset + parseInt(pattern.substr(1), 2);
    },
    overflowAngle: (dots) => {
      const half = (dots.length - 1) / 2;
      return (
        dots[Math.floor(half)].angle +
        dots[Math.ceil(half)].angle
      ) / 2;
    },
    baseIndex: (pattern) => {
      if (pattern.substr(0, 1) === '1') {
        return Math.pow(2, pattern.length) - 1;
      } else {
        return 0;
      }
    },
  },

  complement2: {
    formatter: (pattern) => {
      const offset = pattern.substr(0,1) === '1' ?
        -Math.pow(2, pattern.length - 1) : 0;
      return offset + parseInt(pattern.substr(1), 2);
    },
    overflowAngle: (dots) => {
      const half = (dots.length - 1) / 2;
      return (
        dots[Math.floor(half)].angle +
        dots[Math.ceil(half)].angle
      ) / 2;
    },
    baseIndex: () => 0,
  },
};

// convert numbert into bit pattern string of length
// bitCount.
const bitPattern = (number, bitCount) =>
  Array
    .apply(Array, {length: bitCount})
    .map((__, b) =>
      (1 << (bitCount - b - 1)) & number ? 1 : 0
    ).join('')
;

// generate array of angles for a number circle of
// given bitCount.
const dotArray = (encoding, bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, {length}) => {
    const pattern = bitPattern(index, bitCount);

    return {
      baseIndex: encoding.baseIndex(pattern),
      angle: 2 * Math.PI * index / length,
      value: encoding.formatter(pattern),
      pattern,
    };
  })
;

export default (encoding$, bitCount$, actions) => {
  const modifierFunction$ = O.merge([
    actions.selectBit$.map((bitIndex) => (state) =>
      ({bitCount: state.bitCount, selected: bitIndex})
    ),
  ]);

  return O.combineLatest(encoding$, bitCount$, (enc, bitCount) => {
    const encoding = ENCODINGS[enc];

    const dots = dotArray(encoding, bitCount);
    const dotRadius = 50;
    const circumference = dotRadius * 4 * Math.max(7, dots.length);
    const radius = circumference / 2 / Math.PI;
    const sizeHalf = (radius + dotRadius) + 100 * Math.max(2, bitCount);

    return modifierFunction$
    // number of bits to generate the number circle for
    .startWith({selected: null})
    // apply the function
    .scan((state, modifierFunction) => modifierFunction(state))
    // convert number of bit's into array of angles
    .map(({selected}) => {
      return {
        // number of bits
        bitCount,
        // the dots to draw
        dots,
        // the index of the selected dot
        selected,
        // the radius of a single dot
        dotRadius,
        // the radius of the circle
        radius,
        // the angle at which the overflow occurs
        overflowAngle: encoding.overflowAngle(dots),
        // the bounding box of the circle
        bounds: {
          minX: -sizeHalf,
          minY: -sizeHalf,
          maxX: sizeHalf,
          maxY: sizeHalf,
        },
      };
    });
  })
  .switch()
  .shareReplay(1);
};
