import {Observable as O} from 'rx';
import I from 'immutable';

import * as diagram from './diagram';
import {buildLayout} from './layout';

import {memoize, clamp, padLeft} from '../../../lib/utils';

const kvState = I.Record({
  currentEditMode: 'function',
  currentKvMode: diagram.modeFromName('dnf'),
  currentCube: diagram.kvCube(),
  currentLoop: diagram.kvLoop(),
  currentOutput: 0,
  renameOutput: -1,
  renameOutputValue: null,
  renameOutputValid: false,
  diagram: diagram.newDiagram(),
  errorMessage: null,
}, 'state');

const colorPalette = [
  "#cc0000",
  "#00cc00",
  "#0000cc",
  "#00cccc",
  "#cc00cc",
  "#dddd00",
  "#FFC107",
  "#3F51B5",
  "#8BC34A",
  "#795548",
  "#009688",
  "#2196F3",
  "#FF5722",
  "#9C27B0",
  "#FF9800",
  "#CDDC39",
  "#00BCD4",
  "#E91E63",
  "#4CAF50",
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

const inlineAlphaChannel = (hex) => {
  const channels = hex
    .match(/#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})/i)
    .slice(1)
    .map((val) => parseInt(val, 16));

  const multiplier = channels[3] / 255;

  const color = '#' +
    padLeft(Math.round(channels[0] * multiplier).toString(16), 2, 0) +
    padLeft(Math.round(channels[1] * multiplier).toString(16), 2, 0) +
    padLeft(Math.round(channels[2] * multiplier).toString(16), 2, 0)
  ;

  return color;
};

const generateLoopColor = (i) =>
  inlineAlphaChannel(
    colorPalette[i % colorPalette.length] + (
      (255 - (101 * Math.floor(i / colorPalette.length)) % 251).toString(16)
    )
  )
;

const layout = memoize(buildLayout);

const applyModification = (prev, modfn) => modfn(prev);

const addInput = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
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
    currentKvMode: state.currentKvMode,
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
    currentKvMode: state.currentKvMode,
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
    currentKvMode: state.currentKvMode,
    currentCube: diagram.newCubeFromTo(
      startCell, targetCell, state.diagram.inputs.size
    ),
    currentLoop: diagram.kvLoop({
      color: generateUnique(
        state.diagram.loops
        .map((loop) => loop.color)
        .toSet()
      , generateLoopColor),
      cube: diagram.newCubeFromTo(
        startCell, targetCell, state.diagram.inputs.size
      ),
      outputs: I.Set.of(state.currentOutput),
      mode: state.currentKvMode,
    }),
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const stopTryLoop = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: diagram.kvCube(),
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const removeLoop = (state, loopIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.removeLoop(loopIndex, state.diagram),
  })
;

const addLoop = (state, outputIndex, start, end) => {
  const newCube = diagram.newCubeFromTo(start, end, state.diagram.inputs.size);
  const values = state.diagram.outputs.get(outputIndex).values;
  if (!diagram.isValidCubeForValuesInMode(
    newCube, values, state.currentKvMode
  )) {
    return state;
  }

  const outputs = state.diagram.outputs
    .map((output, index) => ({output, index}))
    .filter(({output}) =>
      diagram.isValidCubeForValuesInMode(newCube,
        output.values, state.currentKvMode)
    ).map(({index}) => index).toSet();

  return kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
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
      mode: state.currentKvMode,
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
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: newDiagram.outputs.size - 1,
    diagram: newDiagram,
  });
};

const removeOutput = (state, outputIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
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
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: clamp(outputIndex, 0, state.diagram.outputs.size - 1),
    diagram: state.diagram,
  })
;

const switchKvMode = (state, mode) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: diagram.modeFromName(mode),
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const switchEditMode = (state, mode) =>
  kvState({
    currentEditMode: mode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const startRename = (state, outputIndex) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    renameOutput: outputIndex,
    renameOutputValue: state.diagram.outputs.get(outputIndex).name,
    renameOutputValid: true,
    diagram: state.diagram,
  })
;

const cancelRename = (state) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: state.diagram,
  })
;

const confirmOutputName = (state) =>
  (state.renameOutput > -1) &&
  state.renameOutputValid ?
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: diagram.renameOutput(
      state.renameOutput,
      state.renameOutputValue,
      state.diagram
    ),
  }) : state
;

const tryOutputName = (state, outputIndex, name) =>
  kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    renameOutput: state.renameOutput,
    renameOutputValue: name,
    renameOutputValid: diagram.isValidOutputName(name),
    diagram: state.diagram,
  })
;

const openDiagram = (state, json) => {
  try {
    const parsed = JSON.parse(json);
    const openedDiagram = diagram.fromJSON(parsed);
    if (openedDiagram) {
      return kvState({
        currentEditMode: state.currentEditMode,
        currentKvMode: state.currentKvMode,
        currentOutput: 0,
        diagram: openedDiagram,
      });
    }
  } catch (e) {
  }

  return kvState({
    currentEditMode: state.currentEditMode,
    currentKvMode: state.currentKvMode,
    currentCube: state.currentCube,
    currentOutput: state.currentOutput,
    diagram: state.diagram,
    errorMessage: "Invalid Data",
  });
};

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
    actions.switchKvMode$.map((mode) => (state) => {
      return switchKvMode(state, mode);
    }),
    actions.switchEditMode$.map((mode) => (state) => {
      return switchEditMode(state, mode);
    }),
    actions.startRename$.map((outputIndex) => (state) => {
      return startRename(state, outputIndex);
    }),
    actions.cancelRename$.map(() => (state) => {
      return cancelRename(state);
    }),
    actions.confirmOutputName$.map(() => (state) => {
      return confirmOutputName(state);
    }),
    actions.tryOutputName$.map(({outputIndex, name}) => (state) => {
      return tryOutputName(state, outputIndex, name);
    }),
    actions.openDiagram$.map((data) => (state) => {
      return openDiagram(state, data);
    })
  );
};

const initialState = kvState();

const stateFromJson = (json) =>
  kvState({
    currentEditMode: json.currentEditMode,
    currentKvMode: diagram.modeFromName(String(json.mode)),
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
