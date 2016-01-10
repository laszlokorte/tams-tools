/**
 * This file contains utility functions
 */

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

// get a function the returns a property
// of the object it get's passed as argument.
export const pluck = (key) =>
  (obj) => obj[key]
;

// if value < min return min
// if value > max return max
// otherwise return value
export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max)
;

// get a string of given width
// by prepending pad to base
export const padLeft = (base, width, pad) =>
  Array(width - String(base).length + 1).join(pad) + base
;

// compose multiple functions to a single one
// compose(a,b,c)(x) === c(b(a(x)))
export const compose = (...functions) =>
  (arg) =>
    functions.reduce((acc, fn) =>
      fn(acc)
    , arg)
;
