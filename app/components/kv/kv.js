import {Observable as O} from 'rx';
import I from 'immutable';
import BitSet from 'bitset.js';

const _mode = I.Record({
  name: 'node',
  allowedValue: null,
}, '_mode');

const MODE_DNF = _mode({name: 'dnf', includes: 1});
const MODE_KNF = _mode({name: 'dnf', includes: 0});

const cube = I.Record({
  include: BitSet(1),
  exclude: BitSet(1),
}, 'cube');

const input = I.Record({
  name: "I1",
}, 'input');

const output = I.Record({
  name: "O1",
  values: I.List(),
}, 'output');

const loop = I.Record({
  cube: cube(),
  color: '#555',
  outputs: I.Set(),
  mode: MODE_DNF,
}, 'loop');

const kv = I.Record({
  inputs: I.List(),
  outputs: I.List(output()),
  loops: I.List(),
}, 'kv');
