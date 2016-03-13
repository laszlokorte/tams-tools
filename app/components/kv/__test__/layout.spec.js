import test from 'ava';

import {buildLayout} from '../lib/layout';

test('KV: Layout Sizes', (t) => {
  [
    {size: 0, count: 0, treeHeight: 0},
    {size: 1, count: 1, treeHeight: 0},
    {size: 2, count: 2, treeHeight: 0},
    {size: 3, count: 3, treeHeight: 0},
    {size: 4, count: 4, treeHeight: 0},

    {size: 5, count: 1, treeHeight: 1},
    {size: 6, count: 2, treeHeight: 1},
    {size: 7, count: 3, treeHeight: 1},
    {size: 8, count: 4, treeHeight: 1},
  ].forEach(({size, count, treeHeight}) => {
    const layout = buildLayout(size);

    t.is(layout.count, count);
    t.is(layout.treeHeight, treeHeight);
  });
});
