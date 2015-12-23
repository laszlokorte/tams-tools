import I from 'immutable';
import BitSet from 'bitset.js';

const _stride = (length, value) =>
  I.List(Array({length: length}).map(() => value))
;

///
/// Data structures
///

/// A output value can either be 1, 0 or X(dont care);
const VALUE_1 = true;
const VALUE_0 = false;
const VALUE_X = null;

/// internal representation of the loop mode
/// the mode is either KNF or DNF
const _mode = I.Record({
  name: 'none',
  includes: null,
}, '_mode');

/// The DNF mode allows the loop to include 1s
export const MODE_DNF = _mode({name: 'dnf', includes: VALUE_1});
/// the KNF mode allows the loop to include 0s
export const MODE_KNF = _mode({name: 'knf', includes: VALUE_0});

/// a cube is the the n dimensional range a loop spans
/// For loop to be not empty the include
/// and exclude bitsets must not intersect.
/// Each bit in the BitSet represents a kv input.
export const kvCube = I.Record({
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
  values: I.List.of(VALUE_1),
}, 'output');

/// A loop is a multi dimensional range that
/// spans over multiple matching input values.
/// It consists of:
/// - a color which is used for
///   identifcation by the user
/// - a cube that represents the range
/// - a set of output indices to which the loop applies
/// - the mode
export const kvLoop = I.Record({
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
  outputs: I.List.of(kvOutput()),
  loops: I.OrderedSet(),
}, 'kv');

///
/// Functions
///

/// Get the name of the given mode.
const modeName = (mode) =>
  mode.name
;

/// Get the mode for the given name.
const modeFromName = (name) => {
  if (name === MODE_DNF.name) {
    return MODE_DNF;
  } else if (name === MODE_KNF.name) {
    return MODE_KNF;
  } else {
    return _mode();
  }
};

/// converts a cell into a scalar integer value.
const cellToInt = (
  /*BitSet*/cell
  ) =>
  parseInt(cell.toString(2), 2)
;

/// converts a cell into an array value.
const cellToArray = (
  /*BitSet*/cell
  ) =>
  cell.toString(2).split("")
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

/// check if the the given given loop blongs to the output
/// of the given index.
export const loopBelongsToOutput = (
  /*kvLoop*/loop,
  /*int*/outputIndex
  ) =>
  loop.outputs.contains(outputIndex)
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
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*kvLoop*/loop
  ) =>
  loopBelongsToOutput(loop, outputIndex) &&
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

/// check if the given cube is valid for the given values
/// and the given mode.
const isValidCubeForValuesInMode = (
  /*kvCube*/cube,
  /*I.List*/values,
  /*_mode*/mode = MODE_DNF
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
    include: mask.and(cube.include),
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

  if (isEmptyCube(newCube) && loop.outputs.size > 1) {
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

/// Add an input with the given name to the given diagram
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
    ).toList(),
    loops: diagram.loops,
  })
;

/// Remove one input from the given diagram.
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
        resizeLoop(diagram.inputs.size - 1, loop)
      )
      .filter((loop) => !isEmptyLoop(loop))
      .toOrderedSet(),
  })
;

/// Rename the input at the given index.
export const renameInput = (
  /*int*/inputIndex,
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs.update(inputIndex,
      () => kvInput({name})
    ),
    outputs: diagram.outputs,
    loops: diagram.loops,
  })
;

/// Add an output with the given name to the given diagram.
export const appendOutput = (
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs.push(kvOutput({
      name,
      values: _stride(diagram.inputs.size, VALUE_X),
    })),
    loops: diagram.loops,
  })
;

/// Remove the output at the given index from the given diagram.
export const removeOutput = (
  /*int*/outputIndex,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs.remove(outputIndex),
    loops: diagram.loops.map(
      (loop) => kvLoop({
        color: loop.color,
        cube: loop.cube,
        mode: loop.mode,
        outputs: loop.outputs
          .filter(
            (o) => o !== outputIndex
          ).map(
            (o) => o >= outputIndex ? Math.max(0, o - 1) : o
          ).toSet(),
      })
    ),
  })
;

/// Rename the output at the given index to the given name.
export const renameOutput = (
  /*int*/outputIndex,
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs.update(outputIndex,
      (output) => kvOutput({
        name,
        values: output.values,
      })
    ),
    loops: diagram.loops,
  })
;

/// Add the given loop to the given diagram.
export const appendLoop = (
  /*kvLoop*/loop,
  /*kvDiagram*/diagram
  ) =>
  kvDiagram({
    inputs: diagram.inputs,
    outputs: diagram.outputs,
    loops: diagram.loops
      .add(resizeLoop(diagram.inputs.size, loop))
      .filter((l) => !isEmptyLoop(l))
      .toOrderedSet(),
  })
;

/// Remove the loop at the given index from the diagram.
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

/// Set the given cell to the given value for the given output.
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
    ).toSet(),
  })
;

/// Get the value for the given output of the given diagram.
export const getValue = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*kvDiagram*/diagram
  ) =>
  diagram.outputs.get(outputIndex).values.get(cellToInt(cell))
;

export const newCubeFromTo = (
  start,
  end
  ) => kvCube({
    include: start.and(end),
    exclude: start.or(end).not(),
  })
;

/// Get a new empty loop
export const newLoop = (
  ) => kvLoop({
    color: '#000',
    cube: kvCube(),
    outputs: I.Set(),
    mode: null,
  })
;

/// Deserialize a cube from given json.
export const cubeFromJson = (
  json
  ) => json === null ? null :
  kvCube(json)
;

/// Get a new diagram
export const newDiagram = (
  ) =>
  appendLoop(
    kvLoop({
      color: 'green',
      cube: kvCube({
        include: BitSet("000"),
        exclude: BitSet("000"),
      }),
      outputs: I.Set.of(0),
      mode: MODE_DNF,
    }),
  appendInput("C",
  appendInput("B",
  appendInput("A",
    kvDiagram()
  ))))
;

/// Deserialize a diagram from the given json.
export const fromJSON = (
  /*object*/json
  ) =>
  kvDiagram({
    inputs: I.fromJS(json.inputs, (i, input) => kvInput({
      name: input,
    })),
    outputs: I.fromJS(json.outputs, (i, output) => kvOutput({
      name: output.name,
      values: I.List(output.values),
    })),
    loops: I.fromJS(json.loops, (i, loop) => kvLoop({
      color: loop.color,
      cube: kvCube({
        include: intToCell(loop.include),
        exclude: intToCell(loop.exclude),
      }),
      outputs: I.Set(loop.outputs),
      mode: modeFromName(loop.mode),
    })),
  })
;

/// Serialize the given diagram into json.
export const toJSON = (
  /*kvDiagram*/diagram
  ) => ({
    inputs: diagram.inputs.map((i) => i.name).toArray(),
    outputs: diagram.outputs.map((o) => ({
      name: o.name,
      values: o.values.toArray(),
    })).toArray(),
    loops: diagram.loops.map((l) => ({
      color: l.color,
      include: cellToInt(l.cube.include),
      exclude: cellToInt(l.cube.exclude),
      outputs: l.outputs.toArray(),
      mode: modeName(l.mode),
    })).toArray(),
  })
;

/// Extract PLA terms of the given diagram for the given mode.
const toPLATerms = (
  /*kvDiagram*/diagram,
  /*_mode*/mode = MODE_DNF
  ) =>
  diagram.outputs.reduce(
    (prev, output, outputIndex) =>
      prev.concat(
        output.values
        .map((value, index) => ({value, index}))
        .filter(({value}) => mode.includes === value)
        .map(({index}) => intToCell(index))
        .filter((cell) =>
          diagram.loops.filter(
            (loop) => loop.mode === mode
          ).filter(
            (loop) => insideLoop(outputIndex, cell, loop)
          ).isEmpty()
        )
        .map((cell) =>
            diagram.inputs.map((i, iIndex) => cell.get(iIndex))
          .concat(
            diagram.outputs.map((_, oIndex) => oIndex === outputIndex ? 1 : 0)
          ).toArray()
        )
      ),
    I.List()).concat(
      diagram.loops.map(
        (loop) =>
          diagram.inputs.map((_, iIndex) => {
            if (loop.cube.include.get(iIndex) === 1) {
              return 1;
            } else if (loop.cube.exclude.get(iIndex) === 1) {
              return 0;
            } else {
              return null;
            }
          }).concat(
            diagram.outputs.map(
              (_, oIndex) => loopBelongsToOutput(loop, oIndex) ? 1 : 0
            )
          ).toArray()
      )
    ).toArray()
;

/// Convert the given diagram to PLA format
/// using the given mode.
export const toPLA = (
  /*kvDiagram*/diagram,
  /*_mode*/mode = MODE_DNF
  ) => ({
    inputs: diagram.inputs.map((i) => i.name).toArray(),
    outputs: diagram.outputs.map((o) => o.name).toArray(),
    loops: toPLATerms(diagram, mode),
  })
;
