/**
 * This File Contains:
 *
 * Utility functions which are not specific for domain of kv diagrams.
 */

// returns the index of the highest bit of the given number
// should be equal to floor(ln2(num))
export const highestBit = (num) => {
  let n = num;
  let count = 0;
  if (n === 0) {
    return 0;
  }
  while (n) {
    n >>= 1;
    ++count;
  }

  return count;
};

// wrap the given function to memoize return values
// for simple parameters
export const memoize = (func) => {
  const map = {};

  return (p, ...args) => {
    // do not memoze complex parameters
    if (args.length > 0 || (
      typeof p !== 'string' &&
      typeof p !== 'number'
    )) {
      return func(p, ...args);
    } if (!map.hasOwnProperty()) {
      const val = map[p] = func(p);
      return val;
    } else {
      return map[p];
    }
  };
};

// fallback for requestAnimationFrame
export const requestFrame = (
  window.requestAnimationFrame ||
  ((cb) => this.setTimeout(cb, 14))
).bind(window);

// fallback for cancelAnimationFrame
export const cancelFrame = (window.cancelAnimationFrame ||
  ((id) => this.clearTimeout(id))
).bind(window);

// wrap a function to to make sure it is not called more
// than 60 times a second.
// Additional the resulting function provides a cancel() method to
// cancel an already queued call
export const throttled = (func) => {
  let id = null;

  const frame = (f, args) => {
    id = null;
    f(...args);
  };

  const newFunc = (...args) => {
    if (id !== null) {
      cancelFrame(id);
      id = null;
    }

    id = requestFrame(frame.bind(null, func, args));
  };

  newFunc.cancel = () => {
    if (id !== null) {
      cancelFrame(id);
      id = null;
    }
  };

  return newFunc;
};

// convert a given number to a binary string of given length
export const formatBinary = (number, length) => {
  return (
    new Array(length)
    .join("0") + number.toString(2)
  ).slice(-length);
};

// get an array of given size
export const arrayOfSize = (size) =>
  Array(...{length: size})
;

// get a number for which the all bits
// from 0 to length are set to 1
export const fillBits = (length) =>
  Math.pow(2, length) - 1
;

// get function which parses the attribute of given name
// from a given event's target as integer
export const parseDataAttr = (attrName) => (evt) =>
  parseInt(evt.currentTarget.dataset[attrName], 10)
;

export const log = (...args) => {
  console.log(...args);
  return args[0];
};

export const pluck = (key) =>
  (obj) => obj[key]
;

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max)
;

export const padLeft = (string, width, pad) =>
  Array(width - String(string).length + 1).join(pad) + string
;
