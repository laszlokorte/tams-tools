
const layoutNode = I.Record({
  label: null,
  children: I.List(),
  x: 0,
  y: 0,
  outlineLeftNext: null,
  outlineRightNext: null,
});

const nodeFromJson = (data, x = 0, y = 0) => {
  const width_2 = Math.floor(data.children.length / 2);
  return layoutNode({
    label: data.name,
    children: I.List(data.children.map((c, i) =>
      nodeFromJson(c, x - width_2 * (1 - i * 2), y + 1)
    )),
    x: x,
    y: y,
  });
};

const nextRight = (node) => {
  if (node.thread) { return node.three; }
  else if (node.children) { return node.children.last(); }
  else { return null; }
};

const nextLeft = (node) => {
  if (node.thread) { return node.three; }
  else if (node.children) { return node.children.first(); }
  else { return null; }
};

const contour = (left, right, maxOffset = 0, leftOuter = left, rightOuter = right) => {
  const newMaxOffset = (left.x - right.x > maxOffset) ?
    left.x - right.x : maxOffset;

  const newLeftOuter = nextLeft(leftOuter);
  const newLeftInner = nextRight(left);
  const newRightOuter = nextRight(rightOuter);
  const newRightInner = nextLeft(right);

  if (newLeftInner && newRightInner) {
    return contour(
      newLeftInner, newRightInner, newMaxOffset,
      newLeftOuter, newRightOuter
    );
  } else {
    return newMaxOffset;
  }
};

const nodeList = (node, acc = I.List()) => {
  return node.children.reduce(
    (prev, c) => nodeList(c, prev)
  , acc.push(node));
};
