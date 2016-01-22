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
