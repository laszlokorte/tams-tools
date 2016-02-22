export const IF = (condition, fn) => {
  if (condition) {
    return fn();
  } else {
    return void 0;
  }
};

export const attrBool = (condition) => {
  if (condition) {
    return condition;
  } else {
    return void 0;
  }
};
