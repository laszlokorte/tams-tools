const equal = (a, b) => {
  if (a === b) {
    return true;
  }

  const aHasLength = a.hasOwnProperty('length');
  const bHasLength = b.hasOwnProperty('length');

  if (aHasLength && bHasLength && a.length === b.length) {
    const length = a.length;
    for (let i = 0; i < length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

const CacheThunk = function thunkConstructor(key, fn, debug = false) {
  this.key = key;
  this.fn = fn;
  this.debug = debug;
};

CacheThunk.prototype.type = "Thunk";

CacheThunk.prototype.render = function thunkRender(previous) {
  if (!previous || !equal(previous.key, this.key)) {
    if (this.debug) {
      console.log("cache busted: " + this.debug);
    }
    return this.fn();
  } else {
    return previous.vnode;
  }
};

export default (key, fn, debug) => {
  return new CacheThunk(fn, key, debug);
};
