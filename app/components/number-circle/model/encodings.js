export default {
  positive: {
    negativeClockwise: false,
    formatter: (pattern) => {
      return parseInt(pattern, 2).toString(10);
    },
    overflowAngles: (dots) => [
      2 * Math.PI - (
        dots[0].angle +
        dots[1].angle
      ) / 2,
    ],
    warningAngles: () => [],
    baseIndex: () => 0,
    magnitude: (pattern) => parseInt(pattern, 2) /
      Math.pow(2, pattern.length),
  },

  signed: {
    negativeClockwise: true,
    formatter: (pattern) => {
      const sign = pattern.substr(0,1) === '1' ?
        '-' : '';

      const num = parseInt(pattern.substr(1), 2) || 0;

      return sign + num.toString(10);
    },
    overflowAngles: (dots) => {
      return [
        Math.PI - (
          dots[0].angle +
          dots[1].angle
        ) / 2,
        2 * Math.PI - (
          dots[0].angle +
          dots[1].angle
        ) / 2,
      ];
    },
    warningAngles: () => [],
    baseIndex: (pattern) => {
      if (pattern.substr(0, 1) === '1') {
        return Math.pow(2, pattern.length - 1);
      } else {
        return 0;
      }
    },
    magnitude: (pattern) => parseInt(
      pattern.substr(1) || '0', 2
    ) / Math.pow(2, pattern.length - 1),
  },

  complement1: {
    negativeClockwise: false,
    formatter: (pattern) => {
      const negative = pattern.substr(0, 1) === '1';
      const offset = negative ?
        -Math.pow(2, pattern.length - 1) + 1 : 0;

      const num = parseInt(pattern.substr(1), 2) || 0;

      return ((negative ? '-' : '') + Math.abs(
        offset + num
      )).toString(10);
    },
    overflowAngles: (dots) => {
      const half = (dots.length - 1) / 2;
      return [(
        dots[Math.floor(half)].angle +
        dots[Math.ceil(half)].angle
      ) / 2,
      ];
    },
    warningAngles: (dots) => [
      2 * Math.PI - (
        dots[0].angle +
        dots[1].angle
      ) / 2,
    ],
    baseIndex: (pattern) => {
      if (pattern.substr(0, 1) === '1') {
        return Math.pow(2, pattern.length) - 1;
      } else {
        return 0;
      }
    },
    magnitude: (pattern) => {
      const negative = pattern.substr(0, 1) === '1';
      const offset = negative ?
        -Math.pow(2, pattern.length - 1) + 1 : 0;

      const num = parseInt(pattern.substr(1), 2) || 0;

      return Math.abs(offset + num) / Math.pow(2, pattern.length - 1);
    },
  },

  complement2: {
    negativeClockwise: false,
    formatter: (pattern) => {
      const offset = pattern.substr(0,1) === '1' ?
        -Math.pow(2, pattern.length - 1) : 0;

      const num = parseInt(pattern.substr(1), 2) || 0;

      return (offset + num).toString(10);
    },
    overflowAngles: (dots) => {
      const half = (dots.length - 1) / 2;
      return [(
        dots[Math.floor(half)].angle +
        dots[Math.ceil(half)].angle
      ) / 2,
      ];
    },
    warningAngles: () => [],
    baseIndex: () => 0,
    magnitude: (pattern) => {
      const offset = pattern.substr(0,1) === '1' ?
        -Math.pow(2, pattern.length - 1) : 0;

      const num = parseInt(pattern.substr(1), 2) || 0;

      return Math.abs(offset + num) /
        Math.pow(2, pattern.length - 1);
    },
  },
};
