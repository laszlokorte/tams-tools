const CacheThunk = function thunkConstructor(key, fn, debug = false) {
  this.key = key;
  this.fn = fn;
  this.debug = debug;
};

CacheThunk.prototype.type = "Thunk";

CacheThunk.prototype.render = function thunkRender(previous) {
  if (!previous || previous.key !== this.key) {
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
