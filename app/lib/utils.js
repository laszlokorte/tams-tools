/**
 * This File Contains:
 *
 * Utility functions which are not specific for domain of kv diagrams.
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

// get function which parses the attribute of given name
// from a given event's target as integer
export const parseDataAttr = (attrName) => (evt) =>
  parseInt(evt.ownerTarget.dataset[attrName], 10)
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
