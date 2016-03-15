const equal = (keyA, keyB) => {
  if (keyA === keyB) {
    return true;
  }

  const aHasLength = keyA.hasOwnProperty('length');
  const bHasLength = keyB.hasOwnProperty('length');

  if (aHasLength && bHasLength && keyA.length === keyB.length) {
    const length = keyA.length;
    for (let i = 0; i < length; i++) {
      if (keyA[i] !== keyB[i]) {
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

// The constructor for simple virtual-dom Thunk object
// prevents DOM updates of child nodes until the cache key
// changes and creates the new child nodes lazyly.
//
// key - the cache key or an array of cache keys
// fn - the function that returns the child nodes
// debug - an optional string that get's logged to the console
//         whenever the cache invalidates.
export default (key, fn, debug) => {
  return new CacheThunk(fn, key, debug);
};
