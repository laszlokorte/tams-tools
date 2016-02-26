/*
  ported from:
  http://billmill.org/pymag-trees/
  https://github.com/llimllib/pymag-trees/
*/
/* eslint-disable no-class/no-class */
class LayoutNode {
  constructor(node, parent = null, depth = 0, number = 1) {
    this.x = -1;
    this.y = depth;
    this.node = node;
    this.children = node.children.map(
      (c,i) => new LayoutNode(c, this, depth + 1, i + 1)
    );
    this.parent = parent;
    this.thread = null;
    this.offset = 0;
    this.ancestor = this;
    this.change = 0;
    this.shift = 0;
    this.leftMostSibling = null;
    this.mod = 0;
    this.number = number;
  }

  leftBrother() {
    let n = null;
    if (this.parent) {
      for (const node of this.parent.children) {
        if (node === this) {
          return n;
        } else {
          n = node;
        }
      }
    }
    return void 0;
  };

  getLeftMostSibling() {
    if (!this.leftMostSibling &&
      this.parent &&
      this !== this.parent.children[0]) {
      this.leftMostSibling = this.parent.children[0];
    }

    return this.leftMostSibling;
  }

  left() {
    return this.thread || (
      this.children.length &&
      this.children[0]
    );
  }
  right() {
    return this.thread || (
      this.children.length &&
      this.children[this.children.length - 1]
    );
  }
};
/*eslint-enable no-class/no-class */

const moveSubtree = (wl, wr, shift) => {
  const subtrees = wr.number - wl.number;
  wr.change -= shift / subtrees;
  wr.shift += shift;
  wl.change += shift / subtrees;
  wr.x += shift;
  wr.mod += shift;
};

const executeShifts = (v) => {
  let shift = 0;
  let change = 0;

  for (let i = v.children.length - 1; i >= 0; i--) {
    const w = v.children[i];
    w.x += shift;
    w.mod += shift;
    change += w.change;
    shift += w.shift + change;
  }
};

const ancestor = (vil, v, default_ancestor) => {
  if (v.parent.children.indexOf(vil.ancestor) > -1) {
    return vil.ancestor;
  } else {
    return default_ancestor;
  }
};

const secondWalk = (v, m = 0, depth = 0) => {
  v.x += m;
  v.y = depth;

  for (const w of v.children) {
    secondWalk(w, m + v.mod, depth + 1);
  }
};

/* eslint-disable max-statements */
const apportion = (v, default_ancestor, distance) => {
  const w = v.leftBrother();
  let new_default_ancestor = default_ancestor;
  if (w !== null) {
    let vir = v;
    let vor = v;
    let vil = w;
    let vol = v.getLeftMostSibling();

    let sir = v.mod;
    let sor = v.mod;
    let sil = vil.mod;
    let sol = vol.mod;
    while (vil.right() && vir.left()) {
      vil = vil.right();
      vir = vir.left();
      vol = vol.left();
      vor = vor.right();
      vor.ancestor = v;
      const shift = (vil.x + sil) - (vir.x + sir) + distance;
      if (shift > 0) {
        const a = ancestor(vil, v, default_ancestor);
        moveSubtree(a, v, shift);
        sir += shift;
        sor += shift;
      }

      sil += vil.mod;
      sir += vir.mod;
      sol += vol.mod;
      sor += vor.mod;
    }

    if (vil.right() && !vor.right()) {
      vor.thread = vil.right();
      vor.mod += sil - sor;
    } else {
      if (vir.left() && !vol.left()) {
        vol.thread = vir.left();
        vol.mod += sir - sol;
      }
      new_default_ancestor = v;
    }
  }
  return new_default_ancestor;
};
/* eslint-enable max-statements */

const firstWalk = (v, distance = 1) => {
  if (v.children.length === 0) {
    if (v.getLeftMostSibling()) {
      v.x = v.leftBrother().x + distance;
    } else {
      v.x = 0;
    }
  } else {
    let default_ancestor = v.children[0];
    for (const w of v.children) {
      firstWalk(w);
      default_ancestor = apportion(
        w, default_ancestor, distance
      );
    }
    executeShifts(v);

    const midpoint = (
      v.children[0].x +
      v.children[v.children.length - 1].x
    ) / 2;

    // const ell = v.children[0];
    // const arr = v.children[v.children.length - 1];
    const w = v.leftBrother();
    if (w) {
      v.x = w.x + distance;
      v.mod = v.x - midpoint;
    } else {
      v.x = midpoint;
    }
  }

  return v;
};

const buchheim = (tree) => {
  const dt = firstWalk(tree);
  secondWalk(dt);

  return dt;
};

export default (data) => {
  const tree = new LayoutNode(data);

  return buchheim(tree);
};
