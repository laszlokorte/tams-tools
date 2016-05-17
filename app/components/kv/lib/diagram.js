import I from 'immutable';
import BitSet from 'bitset.js';

const _stride = (length, value) =>
  I.List(Array.apply(Array, {length: length}).map(() => value))
;

///
/// Data structures
///

/// A output value can either be 1, 0 or X(dont care);
export const VALUE_1 = true;
export const VALUE_0 = false;
export const VALUE_X = null;

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

/// A diagram represents a complete karnaugh map.
/// It contains of all the input variables,
/// all the outputs with their values
/// and a set of all the loops
const kvDiagram = I.Record({
  inputs: I.List(),
  outputs: I.List.of(kvOutput()),
  loops: I.List(),
}, 'kv');

///
/// Functions
///

/// Get the name of the given mode.
const modeName = (mode) =>
  mode.name
;

/// Get the mode for the given name.
export const modeFromName = (name) => {
  if (name === MODE_DNF.name) {
    return MODE_DNF;
  } else if (name === MODE_KNF.name) {
    return MODE_KNF;
  } else {
    return _mode();
  }
};

/// converts a cell into a scalar integer value.
export const cellToInt = (
  /*BitSet*/cell
  ) =>
  parseInt(cell.toString(2), 2)
;

/// converts a scalar integer value into a BitSet.
export const intToCell = (
  /*int*/int
  ) =>
  BitSet(int)
;

const OUTPUT_NAME_MAX_LENGTH = 8;
const SPACE_REG_EXP = /\s+/i;
export const isValidOutputName = (
  /*string*/name
  ) =>
  name.length > 0 &&
  name.length <= OUTPUT_NAME_MAX_LENGTH &&
  name.match(SPACE_REG_EXP) === null
;

/// check if the the given value is allowed
/// to be contained inside a cube for the given mode.
export const isValidValueForMode = (
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

/// check if the given cell is inside the given cube
/// But take into account only the bits
/// which are set in the mask.
/// If the cell's 3rd bit is set and the cube's
/// 3rd exclude bit is set, the cell would be not inside
/// the cube. But if the mask's 3rd bit is not set
/// the cell is considered to be inside the cube anyway.
export const insideCubeMasked = (
  /*BitSet*/cell,
  /*kvCube*/cube,
  /*BitSet*/mask
  ) =>
    mask.and(cube.include.and(cell))
      .equals(mask.and(cube.include)) &&
    mask.and(cube.exclude.and(cell))
      .isEmpty()
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
  /*kvCube*/cube,
  /*int*/inputCount
  ) =>
  !cube.include.and(cube.exclude).isEmpty() ||
  !cube.include.and(inputCount === 0 ?
    cube.include : BitSet().setRange(0, inputCount - 1, 1).not()
  ).isEmpty()
;

/// check if the given loop is empty.
const isEmptyLoop = (
  /*kvLoop*/loop,
  /*int*/inputCount
  ) =>
  loop.outputs.isEmpty() ||
  isEmptyCube(loop.cube, inputCount)
;

/// check if the given cube is valid for the given values
/// and the given mode.
export const isValidCubeForValuesInMode = (
  /*kvCube*/cube,
  /*I.List*/values,
  /*_mode*/mode = MODE_DNF
  ) =>
  values.reduce((prev, value, index) =>
    prev &&
    (
      !insideCube(intToCell(index), cube) ||
      isValidValueForMode(value, mode)
    )
  , true)
;

/// Adjust given cube for a new number of inputs.
const resizeCube = (
  /*int*/inputCount,
  /*kvCube*/cube
  ) => {
  const mask = BitSet().setRange(0, inputCount, 1);

  return cube.merge({
    include: mask.and(cube.include),
    exclude: mask.and(cube.exclude),
  });
};

/// Adjust the given loop for a new number of inputs.
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
  const unused = include.or(exclude).not();
  // bits which could be be added to the loop's positive constraints
  const includableBit = cell.not().and(unused);
  // bits which could be be added to the loop's negative constraints
  const excludableBit = cell.and(unused);

  // extract only the lowest bit
  const lowestIncludableBit = includableBit.lsb();
  const lowestExcludableBit = excludableBit.lsb();

  // check which of the bit's is less significant but not zero
  const changeExclude = !excludableBit.isEmpty() &&
    lowestExcludableBit <= lowestIncludableBit;

  return kvCube({
    exclude: changeExclude ? exclude.set(lowestExcludableBit, 1) : exclude,
    include: !changeExclude ? include.set(lowestIncludableBit, 1) : include,
  });
};

/// Exclude the given cell for the given outputIndex from the given loop.
const excludeFromLoop = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*kvLoop*/loop,
  /*int*/inputCount
  ) => {
  const newCube = excludeFromCube(cell, loop.cube);

  if (isEmptyCube(newCube, inputCount) && loop.outputs.size > 1) {
    return loop.removeIn(['outputs', outputIndex]);
  } else {
    return loop.set('cube', newCube);
  }
};

/// Add an input with the given name to the given diagram
export const appendInput = (
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('inputs', (inputs) =>
    inputs.push(kvInput({
      name,
    }))
  ).update('outputs', (outputs) =>
    outputs.map(
      (output) => output.set('values',
        output.values.concat(output.values)
      )
    ).toList()
  )
;

/// Remove one input from the given diagram.
export const popInput = (
  /*kvDiagram*/diagram
  ) =>
  diagram
  .update('inputs', (inputs) => inputs.pop())
  .update('outputs', (outputs) =>
    outputs.map(
      (output) => output.set('values',
        output.values.setSize(output.values.size / 2)
      )
    ).toList()
  )
  .update('loops', (loops) =>
    loops.map(
      (loop) => resizeLoop(diagram.inputs.size - 1, loop)
    )
    .filter((loop) => !isEmptyLoop(loop, diagram.inputs.size - 1))
    .toList()
  )
;

/// Rename the input at the given index.
export const renameInput = (
  /*int*/inputIndex,
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  diagram.updateIn(['inputs', inputIndex,'name'], name)
;

/// Add an output with the given name to the given diagram.
export const appendOutput = (
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('outputs', (outputs) =>
    outputs.push(kvOutput({
      name,
      values: _stride(Math.pow(2, diagram.inputs.size), VALUE_0),
    }))
  )
;

const decrementValuesAbove = (limit) => (value) =>
  value > limit ? Math.max(0, value - 1) : value
;

/// Remove the output at the given index from the given diagram.
export const removeOutput = (
  /*int*/outputIndex,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('loops', (loops) =>
    loops.map(
      (loop) => loop.update('outputs', (outputs) =>
        outputs
        .remove(outputIndex)
        .map(decrementValuesAbove(outputIndex - 1))
        .toSet()
      )
    )
    .filter((l) => !isEmptyLoop(l, diagram.inputs.size))
    .toList()
  ).removeIn(['outputs', outputIndex])
;

/// Rename the output at the given index to the given name.
export const renameOutput = (
  /*int*/outputIndex,
  /*String*/name,
  /*kvDiagram*/diagram
  ) =>
  diagram.setIn(
    ['outputs', outputIndex, 'name'], name
  )
;

/// Add the given loop to the given diagram.
export const appendLoop = (
  /*kvLoop*/loop,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('loops', (loops) =>
    loops
      .push(resizeLoop(diagram.inputs.size, loop))
      .filter((l) => !isEmptyLoop(l, diagram.inputs.size))
      .toList()
  )
;

/// Remove the loop at the given index from the diagram.
export const removeLoop = (
  /*int*/loopIndex,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('loops',
    (loops) => loops.delete(loopIndex)
  )
;

/// Remove the loop at the given index from the output of the given diagram.
export const removeLoopFromOutput = (
  /*int*/loopIndex,
  /*int*/outputIndex,
  /*kvDiagram*/diagram
  ) =>
  diagram.update('loops', (loops) =>
    loops.updateIn([loopIndex, 'outputs'],
      (outputs) => outputs.remove(outputIndex)
    )
    .filter((loop) => !isEmptyLoop(loop, diagram.inputs.size))
    .toList()
  )
;

/// Set the given cell to the given value for the given output.
export const setValue = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*mixed*/value,
  /*kvDiagram*/diagram
  ) =>
  diagram.updateIn(['outputs', outputIndex, 'values'],
    (values) => values.set(cellToInt(cell), value)
  ).update('loops', (loops) =>
    loops.map((loop) =>
      !loopBelongsToOutput(loop, outputIndex) ||
      isValidValueForMode(value, loop.mode) ?
        loop : excludeFromLoop(outputIndex, cell, loop, diagram.inputs.size)
    )
    .filter((loop) => !isEmptyLoop(loop, diagram.inputs.size))
    .toList()
  )
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
  /*BitSet*/start,
  /*BitSet*/end,
  /*int*/inputCount
  ) =>
  inputCount > 0 ?
  kvCube({
    include: start.and(end).getRange(0, inputCount - 1),
    exclude: start.or(end).not().getRange(0, inputCount - 1),
  }) :
  kvCube({
    include: BitSet(),
    exclude: BitSet(),
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

/// Get a new diagram
export const newDiagram = (
  ) =>
  appendInput("C",
  appendInput("B",
  appendInput("A",
    kvDiagram()
  )))
;

/// Deserialize a diagram from the given json.
export const fromJSON = (
  /*object*/json
  ) =>
  kvDiagram({
    inputs: I.List(json.inputs).map((input) => kvInput({
      name: input,
    })),
    outputs: I.List(json.outputs).map((output) => kvOutput({
      name: output.name,
      values: I.List(output.values),
    })),
    loops: I.List(json.loops).map((loop) => kvLoop({
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
  /*_mode*/mode = MODE_DNF,
  /*kvCube*/highlightCube
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
        .map((cell) => ({
          in:
            diagram.inputs
            .map((i, iIndex) => cell.get(iIndex) ? true : false)
            .toArray(),
          out:
            diagram.outputs
            .map((_, oIndex) => oIndex === outputIndex)
            .toArray(),
          highlight: highlightCube && insideCube(cell, highlightCube),
        })
      )
    ),
    I.List()).concat(
      diagram.loops
        .filter(
          (loop) => loop.mode === mode
        ).map(
        (loop) => ({
          in: diagram.inputs.map((_, iIndex) => {
            if (loop.cube.include.get(iIndex) === 1) {
              return true;
            } else if (loop.cube.exclude.get(iIndex) === 1) {
              return false;
            } else {
              return null;
            }
          }).toArray(),
          out: diagram.outputs.map(
            (_, oIndex) => loopBelongsToOutput(loop, oIndex) ? true : false
          ).toArray(),
          color: loop.color,
        })
      )
    ).toArray()
;

/// Convert the given diagram to PLA format
/// using the given mode.
export const toPLA = (
  /*kvDiagram*/diagram,
  /*_mode*/mode = MODE_DNF,
  /*kvCube*/highlightCube
  ) => ({
    mode: mode.name,
    inputs: diagram.inputs.map((i) => i.name).toArray(),
    outputs: diagram.outputs.map((o) => o.name).toArray(),
    loops: toPLATerms(diagram, mode, highlightCube),
  })
;
