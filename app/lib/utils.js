/**
 * This File Contains:
 *
 * Utility functions which are not specific for domain of kv diagrams.
 */

// Zip the values of the given arrays with the given function
// result: [f(a[0],b[0]), f(a[1],b[1]), f(a[2],b[2]), ...]
export const zip = (a, b, func) => {
  const result = [];
  for (let i = 0, j = Math.min(a.length, b.length);i < j;i++) {
    result.push(func(a[i], b[i]));
  }
  return result;
};

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

// prevent the default browser behaviour for the given event
export const preventDefault = (evt) =>
  evt.preventDefault()
;

// get function which parses the attribute of given name
// from a given event's target as integer
export const parseDataAttr = (attrName) => (evt) =>
  parseInt(evt.target.dataset[attrName], 10)
;

export const log = (...args) => {
  console.log(...args);
  return args[0];
};
