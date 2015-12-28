import {Observable as O} from 'rx';
import I from 'immutable';

import * as diagram from './diagram';
import {buildLayout} from './layout';

import {memoize, clamp} from '../../../lib/utils';

const kvState = I.Record({
  currentEditMode: 'edit',
  currentMode: diagram.modeFromName('dnf'),
  currentCube: diagram.kvCube(),
  currentOutput: 0,
  diagram: diagram.newDiagram(),
}, 'state');

const colorPalette = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
];

const generateUnique = (set, generator, i = set.size) => {
  const newName = generator(i);

  if (set.contains(newName)) {
    return generateUnique(set, generator, i + 1);
  } else {
    return newName;
  }
};

const generateInputName = (i) =>
  String.fromCharCode(65 + i % 25) + (
    i > 25 ? (i / 25 + 1).toString() : ''
  )
;

const generateOutputName = (i) =>
  "O" + (i + 1)
;

const toRGBA = (hex) => {
  const channels = hex
    .match(/#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})/i)
    .slice(1)
    .map((val) => parseInt(val, 16));

  const color = `rgba(
    ${channels[0]},
    ${channels[1]},
    ${channels[2]},
    ${channels[3] / 255})`;

  return color;
};

const generateLoopColor = (i) =>
  toRGBA(
    colorPalette[i % colorPalette.length] + (
      (255 - 100 * Math.floor(i / colorPalette.length)).toString(16)
    )
  )
;

const layout = memoize(buildLayout);

const applyModification = (prev, modfn) => modfn(prev);

const addInput = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.appendInput(
      generateUnique(
        state.diagram.inputs
        .map((input) => input.name)
        .toSet()
      , generateInputName),
      state.diagram
    ),
  })
;

const removeInput = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.popInput(
      state.diagram
    ),
  })
;

const nextValue = (
  /*mixed*/currentValue,
  /*boolean*/reverse
  ) => {
  const prev = (currentValue === false) ? null : !currentValue;
  const next = (currentValue === true) ? null : currentValue === false;

  return reverse ? prev : next;
};

const cycleValue = (
  state,
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*boolean*/reverse
  ) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.setValue(
      outputIndex,
      cell,
      nextValue(
        diagram.getValue(outputIndex, cell, state.diagram),
        reverse
      ),
      state.diagram
    ),
  })
;

const tryLoop = (state, startCell, targetCell) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: diagram.newCubeFromTo(
      startCell, targetCell, state.diagram.inputs.size
    ),
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const stopTryLoop = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: diagram.kvCube(),
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const removeLoop = (state, loopIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.removeLoop(loopIndex, state.diagram),
  })
;

const addLoop = (state, outputIndex, start, end) => {
  const newCube = diagram.newCubeFromTo(start, end, state.diagram.inputs.size);
  const values = state.diagram.outputs.get(outputIndex).values;
  if (!diagram.isValidCubeForValuesInMode(newCube, values, state.currentMode)) {
    return state;
  }

  const outputs = state.diagram.outputs
    .map((output, index) => ({output, index}))
    .filter(({output}) =>
      diagram.isValidCubeForValuesInMode(newCube,
        output.values, state.currentMode)
    ).map(({index}) => index).toSet();

  return kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.appendLoop(diagram.kvLoop({
      color: generateUnique(
        state.diagram.loops
        .map((loop) => loop.color)
        .toSet()
      , generateLoopColor),
      cube: newCube,
      outputs: outputs,
      mode: state.currentMode,
    }), state.diagram),
  });
};

const addOutput = (state) => {
  const newDiagram = diagram.appendOutput(
    generateUnique(
      state.diagram.outputs
      .map((output) => output.name)
      .toSet()
    , generateOutputName),
    state.diagram
  );

  return kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: newDiagram.outputs.size - 1,
    diagram: newDiagram,
  });
};

const removeOutput = (state, outputIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: Math.max(0,
      state.currentOutput >= outputIndex ?
      state.currentOutput - 1 : state.currentOutput),
    diagram: diagram.removeOutput(
      outputIndex,
      state.diagram
    ),
  })
;

const selectOutput = (state, outputIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    currentOutput: clamp(outputIndex, 0, state.diagram.outputs.size - 1),
    diagram: state.diagram,
  })
;

const switchMode = (state, mode) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentMode: diagram.modeFromName(mode),
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const modifiers = (actions) => {
  return O.merge(
    actions.addInput$.map(() => (state) => {
      return addInput(state);
    }),
    actions.removeInput$.map(() => (state) => {
      return removeInput(state);
    }),
    actions.cycleValue$.map(({output, cell, reverse}) => (state) => {
      return cycleValue(state, output, cell, reverse);
    }),
    actions.tryLoop$.map(({startCell, targetCell}) => (state) => {
      return tryLoop(state, startCell, targetCell);
    }),
    actions.stopTryLoop$.map(() => (state) => {
      return stopTryLoop(state);
    }),
    actions.removeLoop$.map((loopIndex) => (state) => {
      return removeLoop(state, loopIndex);
    }),
    actions.addLoop$.map(({output, startCell, targetCell}) => (state) => {
      return addLoop(state, output, startCell, targetCell);
    }),
    actions.addOutput$.map(() => (state) => {
      return addOutput(state);
    }),
    actions.removeOutput$.map((index) => (state) => {
      return removeOutput(state, index);
    }),
    actions.selectOutput$.map((index) => (state) => {
      return selectOutput(state, index);
    }),
    actions.switchMode$.map((mode) => (state) => {
      return switchMode(state, mode);
    })
  );
};

const initialState = kvState();

const stateFromJson = (json) =>
  kvState({
    currentEditMode: json.currentEditMode,
    currentMode: diagram.modeFromName(String(json.mode)),
    currentCube: diagram.cubeFromJson(json.cube),
    currentOutput: json.currentOutput,
    diagram: diagram.fromJSON(json),
  })
;

export default (initial$, actions) =>
    O.merge(
      initial$
      .map(stateFromJson)
      .startWith(initialState)
      .map((kv) => () => kv),
      modifiers(actions)
    ).scan(applyModification, null)
    .map((state) => ({
      state: state,
      layout: layout(state.diagram.inputs.size),
    }))
;
