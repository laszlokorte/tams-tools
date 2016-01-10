import {Observable as O} from 'rx';
import I from 'immutable';

import * as KVD from './diagram';
import {buildLayout} from './layout';

import {memoize, clamp, padLeft, compose} from '../../../lib/utils';

const kvState = I.Record({
  currentEditMode: 'loops',
  currentKvMode: KVD.modeFromName('dnf'),
  currentCube: KVD.kvCube(),
  currentLoop: KVD.kvLoop(),
  currentOutput: 0,
  renameOutput: -1,
  renameOutputValue: null,
  renameOutputValid: false,
  diagram: KVD.newDiagram(),
  errorMessage: null,
  viewSetting: 'function',
}, 'state');

const colorPalette = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
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

const clearError = (state) =>
  state ? state.remove('errorMessage') : state
;

const addInput = (state) =>
  state.update('diagram', (diagram) =>
    KVD.appendInput(
      generateUnique(
        diagram.inputs
        .map((input) => input.name)
        .toSet()
      , generateInputName),
      diagram
    )
  )
;

const removeInput = (state) =>
  state.update('diagram', (diagram) =>
    KVD.popInput(
      diagram
    )
  )
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
  state.update('diagram', (diagram) =>
    KVD.setValue(
      outputIndex,
      cell,
      nextValue(
        KVD.getValue(outputIndex, cell, diagram),
        reverse
      ),
      diagram
    )
  )
;

const tryLoop = ({state, startCell, targetCell, allOutputs}) =>
  state
  .set('currentCube',
    KVD.newCubeFromTo(
      startCell, targetCell, state.diagram.inputs.size
    )
  ).set('currentLoop',
    KVD.kvLoop({
      color: generateUnique(
        state.diagram.loops
        .map((loop) => loop.color)
        .toSet()
      , generateLoopColor),
      cube: KVD.newCubeFromTo(
        startCell, targetCell, state.diagram.inputs.size
      ),
      outputs: allOutputs ?
        I.Set(state.diagram.outputs.keys()) : I.Set.of(state.currentOutput),
      mode: state.currentKvMode,
    })
  )
;

const stopTryLoop = (state) =>
  state
  .set('currentCube', KVD.kvCube())
  .set('currentLoop', KVD.kvLoop())
;

const removeLoop = (state, loopIndex, allOutputs) =>
  state.update('diagram', (diagram) =>
    allOutputs ? KVD.removeLoop(loopIndex, diagram) :
      KVD.removeLoopFromOutput(loopIndex, state.currentOutput, diagram)
  )
;

const addLoop = ({
  state, outputIndex,
  start, end, allMatchingOutputs = true,
}) => {
  const newCube = KVD.newCubeFromTo(start, end, state.diagram.inputs.size);
  const values = state.diagram.outputs.get(outputIndex).values;
  if (!KVD.isValidCubeForValuesInMode(
    newCube, values, state.currentKvMode
  )) {
    return state;
  }

  const outputs = allMatchingOutputs ?
    state.diagram.outputs
    .map((output, index) => ({output, index}))
    .filter(({output}) =>
      KVD.isValidCubeForValuesInMode(newCube,
        output.values, state.currentKvMode)
    ).map(({index}) => index).toSet() : I.Set.of(outputIndex);

  return state.update('diagram', (diagram) =>
    KVD.appendLoop(KVD.kvLoop({
      color: generateUnique(
        diagram.loops
        .map((loop) => loop.color)
        .toSet()
      , generateLoopColor),
      cube: newCube,
      outputs: outputs,
      mode: state.currentKvMode,
    }), diagram)
  );
};

const addOutput = (state) => {
  const newDiagram = KVD.appendOutput(
    generateUnique(
      state.diagram.outputs
      .map((output) => output.name)
      .toSet()
    , generateOutputName),
    state.diagram
  );

  return state
    .set('diagram', newDiagram)
    .set('currentOutput', newDiagram.outputs.size - 1);
};

const removeOutput = (state, outputIndex) =>
  state.update('currentOutput', (currentOutput) =>
    Math.max(0,
      currentOutput >= outputIndex ?
      currentOutput - 1 : currentOutput
    )
  ).update('diagram', (diagram) =>
    KVD.removeOutput(
      outputIndex,
      diagram
    )
  )
;

const selectOutput = (state, outputIndex) =>
  state.set('currentOutput',
    clamp(outputIndex, 0, state.diagram.outputs.size - 1))
;

const switchKvMode = (state, mode) =>
  state.set('currentKvMode', KVD.modeFromName(mode))
;

const switchEditMode = (state, mode) =>
  state.set('currentEditMode', mode)
;

const startRename = (state, outputIndex) =>
  state
    .set('renameOutput', outputIndex)
    .set('renameOutputValue',
      state.diagram.outputs.get(outputIndex).name)
    .set('renameOutputValid', true)
;

const cancelRename = (state) =>
  state
    .remove('renameOutput')
    .remove('renameOutputValue')
    .remove('renameOutputValid')
;

const confirmOutputName = (state) =>
  (state.renameOutput > -1) &&
  state.renameOutputValid ?
  state
    .remove('renameOutput')
    .remove('renameOutputValue')
    .remove('renameOutputValid')
    .update('diagram', (diagram) =>
      KVD.renameOutput(
        state.renameOutput,
        state.renameOutputValue,
        diagram
      )
    ) : state
;

const tryOutputName = (state, outputIndex, name) =>
  state
    .set('renameOutputValue', name)
    .set('renameOutputValid', KVD.isValidOutputName(name))

;

const openDiagram = (state, json) => {
  try {
    const parsed = JSON.parse(json);
    const openedDiagram = KVD.fromJSON(parsed);
    if (openedDiagram) {
      return state
        .set('diagram', openedDiagram)
        .set('currentOutput', 0);
    }
  } catch (e) {
  }

  return state.set('errorMessage', 'InvalidData');
};

const setViewSetting = (state, viewSetting) =>
  state.set('viewSetting', viewSetting)
;

const modifiers = (actions) => {
  return O.merge(
    actions.addInput$.map(() =>
      compose(cancelRename, addInput)
    ),
    actions.removeInput$.map(() =>
      compose(cancelRename, removeInput)
    ),
    actions.cycleValue$.map(({output, cell, reverse}) => (state) => {
      return cycleValue.bind(cancelRename(state), output, cell, reverse);
    }),
    actions.tryLoop$.map(({
      startCell, targetCell,
      allOutputs = true,
    }) => (state) => {
      return tryLoop({state, startCell, targetCell, allOutputs});
    }),
    actions.stopTryLoop$.map(() => (state) => {
      return stopTryLoop(state);
    }),
    actions.removeLoop$.map(({loopIndex, allOutputs}) => (state) => {
      return removeLoop(state, loopIndex, allOutputs);
    }),
    actions.addLoop$.map(({
      output, startCell, targetCell,
      allOutputs = true,
    }) => (state) => {
      return addLoop({
        state, outputIndex: output,
        start: startCell, end: targetCell,
        allMatchingOutputs: allOutputs,
      });
    }),
    actions.addOutput$.map(() =>
      compose(cancelRename, addOutput)
    ),
    actions.removeOutput$.map((index) => (state) => {
      return removeOutput(cancelRename(state), index);
    }),
    actions.selectOutput$.map((index) => (state) => {
      return selectOutput(cancelRename(state), index);
    }),
    actions.switchKvMode$.map((mode) => (state) => {
      return switchKvMode(cancelRename(state), mode);
    }),
    actions.switchEditMode$.map((mode) => (state) => {
      return switchEditMode(cancelRename(state), mode);
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
      return openDiagram(cancelRename(state), data);
    }),
    actions.setViewSetting$.map((viewSetting) => (state) => {
      return setViewSetting(cancelRename(state), viewSetting);
    })
  );
};

const initialState = kvState();

const stateFromJson = (json) =>
  kvState({
    currentEditMode: json.currentEditMode,
    currentKvMode: KVD.modeFromName(String(json.mode)),
    currentCube: KVD.cubeFromJson(json.cube),
    currentOutput: json.currentOutput,
    diagram: KVD.fromJSON(json),
  })
;

const applyModification = (prev, modfn) => {
  return modfn(clearError(prev));
};

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
