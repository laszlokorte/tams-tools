// The constructor for simple virtual-dom Thunk object
// prevents DOM updates of child nodes until the cache key
// changes
export const ContentThunk = function thunkConstructor(node, key) {
  this.node = node;
  this.key = key;
};

ContentThunk.prototype.type = "Thunk";

ContentThunk.prototype.render = function thunkRender(previous) {
  if (!previous || previous.key !== this.key) {
    return this.node;
  } else {
    return previous.vnode;
  }
};
