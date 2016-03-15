// "if" defined as a function to be used as expression
//
// condition - a boolean values
// fn - a function which return value is returned if
//      condition is truthy
//
// returns void if condition is falsy
export const IF = (condition, fn) => {
  if (condition) {
    return fn();
  } else {
    return void 0;
  }
};

// convert falsy values to void
export const attrBool = (condition) => {
  if (condition) {
    return condition;
  } else {
    return void 0;
  }
};
