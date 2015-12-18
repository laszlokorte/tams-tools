import I from 'immutable';
import BitSet from 'bitset.js';

const _stride = (length, value) =>
  I.List(Array({length: length}).map(() => value))
;

///
/// Data structures
///

/// A output value can either be 1, 0 or X(dont care);
const VALUE_1 = 1;
const VALUE_0 = 0;
const VALUE_X = null;

/// internal representation of the loop mode
/// the mode is either KNF or DNF
const _mode = I.Record({
  name: 'none',
  allowedValue: null,
}, '_mode');

/// The DNF mode allows the loop to include 1s
export const MODE_DNF = _mode({name: 'dnf', includes: VALUE_1});
/// the KNF mode allows the loop to include 0s
export const MODE_KNF = _mode({name: 'knf', includes: VALUE_0});

/// a cube is the the n dimensional range a loop spans
/// For loop to be not empty the include
/// and exclude bitsets must not intersect.
/// Each bit in the BitSet represents a kv input.
const kvCube = I.Record({
  include: BitSet(1),
  exclude: BitSet(1),
}, 'cube');

/// input is a input variable of the function to optimize.
/// It consists just of it's name.
const kvInput = I.Record({
  name: "I1",
}, 'input');

/// output represents an output value of the function
/// to optimize.
/// It consists of it's name and a list `2 to the power of n`
/// values where n is the number of inputs.
const kvOutput = I.Record({
  name: "O1",
  values: I.List(),
}, 'output');

/// A loop is a multi dimensional range that
/// spans over multiple matching input values.
/// It consists of:
/// - a color which is used for
///   identifcation by the user
/// - a cube that represents the range
/// - a set of output indices to which the loop applies
/// - the mode
const kvLoop = I.Record({
  color: '#555',
  cube: kvCube(),
  outputs: I.Set(),
  mode: MODE_DNF,
}, 'loop');

/// a diagram represents a complete kv diagram
/// it contains of all the input variables,
/// all the outputs with their values
/// and a set of all the loops
const kvDiagram = I.Record({
  inputs: I.List(),
  outputs: I.List(kvOutput()),
  loops: I.Set(),
}, 'kv');

///
/// Functions
///

/// converts a cell into a scalar integer value.
const cellToInt = (
  /*BitSet*/cell
  ) =>
  parseInt(cell.toString(2), 2)
;

/// converts a scalar integer value into a BitSet.
const intToCell = (
  /*int*/int
  ) =>
  BitSet(int)
;

/// check if the the given value is allowed
/// to be contained inside a cube for the given mode.
const isValidValueForMode = (
  /*mixed*/value,
  /*_mode*/mode
  ) =>
  value === null || value === mode.includes
;

/// check if the given cell is inside the given cube.
export const insideCube = (
  /*BitSet*/cell,
  /*kvCube*/cube
  ) =>
  cube.include.and(cell).equals(cube.include) &&
  cube.exclude.and(cell).isEmpty()
;

/// check if the given cell is inside the given loop.
export const insideLoop = (
  /*BitSet*/cell,
  /*kvLoop*/loop
  ) =>
  insideCube(cell, loop.cube)
;

/// check if the given cube is empty.
const isEmptyCube = (
  /*kvCube*/cube
  ) =>
  !cube.include.and(cube.exclude).isEmpty()
;

/// check if the given loop is empty.
const isEmptyLoop = (
  /*kvLoop*/loop
  ) =>
  loop.outputs.isEmpty() ||
  isEmptyCube(loop.cube)
;

/// check if the the given given loop blongs to the output
/// of the given index.
export const loopBelongsToOutput = (
  /*kvLoop*/loop,
  /*int*/outputIndex
  ) =>
  loop.outputs.contains(outputIndex)
;

/// check if the given cube is valid for the given values
/// and the given mode.
const isValidCubeForValuesInMode = (
  /*kvCube*/cube,
  /*I.List*/values,
  /*_mode*/mode
  ) =>
  values.reduce((value, index) =>
    !insideCube(intToCell(index)) ||
    isValidValueForMode(value, mode)
  , true)
;

/// Adjust given cube for a new amount of inputs.
const resizeCube = (
  /*int*/inputCount,
  /*kvCube*/cube
  ) => {
  const mask = BitSet().setRange(0, inputCount, 1);
  return kvCube({
    include: mask.and(kvCube),
    exclude: mask.and(cube.exclude),
  });
};

/// Adjust the given loop for a new amount of inputs.
const resizeLoop = (
  /*int*/inputCount,
  /*kvLoop*/loop
  ) =>
  loop.update('cube', (cube) => resizeCube(inputCount, cube))
;

/// Adjust the given cube to not contain the given cell anymore.
const excludeFromCube = (
  /*BitSet*/cell,
  /*kvCube*/cube
  ) => {
  const include = cube.include;
  const exclude = cube.exclude;

  if (!insideCube(cell, cube)) {
    return cube;
  }

  // the bits by which are not constrained by the loop
  const unused = include.or(exclude).flip();
  // bits which could be be added to the loop's positive constraints
  const includableBit = cell.flip().and(unused);
  // bits which could be be added to the loop's negative constraints
  const excludableBit = cell.and(unused);

  // extract only the lowest bit
  const highestIncludableBit = BitSet(includableBit.msb());
  const highestExcludableBit = BitSet(excludableBit.msb());

  // check which of the bit's is less significant but not zero
  const changeExclude = highestExcludableBit.isEmpty() ||
    highestIncludableBit.msb() >= highestExcludableBit.msb();

  return kvCube({
    include: changeExclude ? highestExcludableBit.or(include) : include,
    exclude: !changeExclude ? highestIncludableBit.or(exclude) : exclude,
  });
};

/// Exclude the given cell for the given outputIndex from the given loop.
const excludeFromLoop = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*kvLoop*/loop
  ) => {
  const newCube = excludeFromCube(cell, loop);

  if (isEmptyCube(newCube) && loop.outputs.count() > 1) {
    return kvLoop({
      color: loop.color,
      cube: loop.cube,
      outputs: loop.outputs.remove(outputIndex),
      mode: loop.mode,
    });
  } else {
    return kvLoop({
      color: loop.color,
      cube: newCube,
      outputs: loop.outputs,
      mode: loop.mode,
    });
  }
};

export const appendInput = (
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs.push(kvInput({
      name,
    })),
    outputs: diagram.outputs.map(
      (output) => output.set('values',
        output.values.concat(output.values)
      )
    ),
    loops: diagram.loops,
  })
;

export const popInput = (
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs.pop(),
    outputs: diagram.outputs.map(
      (output) => output.set('values',
        output.values.setSize(output.values / 2)
      )
    ),
    loops: diagram.loops
      .map((loop) =>
        resizeLoop(diagram.inputs.count - 1, loop)
      )
      .filter((loop) => !isEmptyLoop(loop))
      .toSet(),
  })
;

export const appendOutput = (
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs.push(kvOutput({
      name,
      values: _stride(diagram.inputs.count, VALUE_X),
    })),
    loops: diagram.loops,
  })
;

export const removeOutput = (
  /*int*/outputIndex,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs.remove(outputIndex),
    loops: diagram.loops.map(
      (loop) => loop.outputs.filter(
        (o) => o !== outputIndex
      ).map(
        (o) => o >= outputIndex ? Math.max(0, o - 1) : o
      )
    ).toSet(),
  })
;

export const appendLoop = (
  /*kvLoop*/loop,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs,
    loops: diagram.loops
      .add(resizeLoop(diagram.inputs.count, loop))
      .filter((l) => !isEmptyLoop(l))
      .toSet(),
  })
;

export const removeLoop = (
  /*int*/loopIndex,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs,
    loops: diagram.loops.delete(loopIndex),
  })
;

export const setValue = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*mixed*/value,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.update(outputIndex, (output) =>
      output.update('values', (values) =>
        values.set(cellToInt(cell), value)
      )
    ),
    loops: diagram.loops.map((loop) =>
      isValidValueForMode(value, loop.mode) ?
        loop : excludeFromLoop(outputIndex, cell, loop)
    ),
  })
;

export const getValue = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*kvDiagram*/diagram
  ) =>
  diagram.outputs.get(outputIndex).values.get(cellToInt(cell))
;
