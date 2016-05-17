import {Observable as O} from 'rx';
import I from 'immutable';

import * as KVD from '../lib/diagram';
import {buildLayout} from '../lib/layout';

import {memoize, clamp, padLeft, compose} from '../../../lib/utils';

import expressionImport from './expression-import';
import colorPalette from './colors';
import {generateUnique} from './unique';

const MAX_INPUTS = 8;
const MAX_OUTPUTS = 7;

const kvState = I.Record({
  maxInputs: MAX_INPUTS, // maximal number of input ports
  maxOutputs: MAX_INPUTS, // maximal number of output ports
  currentEditMode: 'loops', // 'loops' or 'functions'
  currentKvMode: KVD.modeFromName('dnf'), // mode of currently edited loop
  currentLoop: KVD.kvLoop(), // the loop currently being created
  currentOutput: 0, // the currently selected output
  renameOutput: -1, // the output currently being renamed
  renameOutputValue: null, // the new name for the currently renamed output
  renameOutputValid: false, // if the new output name is valid
  diagram: KVD.newDiagram(), // the Karnaugh map being edited
  errorMessage: null, // The current error message
  viewSetting: 'function', // the style in which cells are displayed.
                           // function - the function's value inside a cell
                           // decimal - the cell's index as decimal number
                           // binary - the cell's index as binary number
}, 'state');

// Generate an input name from a number
// return's the n'th letter of the alphabet
const inputName = (n) =>
  String.fromCharCode(65 + n % 25) + (
    n > 25 ? (n / 25 + 1).toString() : ''
  )
;

// generate an output name from a number
const outputName = (n) =>
  "O" + (n + 1)
;

// convert 32 bit hex color values (#rrggbbaa) into
// 24 bit hex color values (#rrggbb) by multiplying the rgb
// channels with the alpha channel
//
// eg #ffaa0088 -> #885500
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

// generate a color (#rrggbb) from a number
const loopColor = (n) =>
  inlineAlphaChannel(
    colorPalette[n % colorPalette.length] + (
      (255 - (101 * Math.floor(n / colorPalette.length)) % 251).toString(16)
    )
  )
;

// memoize the function for generating kv layouts
const layout = memoize(buildLayout);

// reset the state's error message
const clearError = (state) =>
  state ? state.remove('errorMessage') : state
;

// add an input the Karnaugh map of state
const addInput = (state) =>
  state.update('diagram', (diagram) =>
    KVD.appendInput(
      generateUnique(
        inputName,
        diagram.inputs
        .map((input) => input.name)
        .toSet()),
      diagram
    )
  )
;

// remove an input from the Karnaugh map of state
const removeInput = (state) =>
  state.update('diagram', (diagram) =>
    KVD.popInput(
      diagram
    )
  )
;

// cycles through possible output values:
// true -> null -> false
// true -> false -> null (if reverse)
const nextValue = (
  /*mixed*/currentValue,
  /*boolean*/reverse
  ) => {
  const prev = (currentValue === false) ? null : !currentValue;
  const next = (currentValue === true) ? null : currentValue === false;

  return reverse ? prev : next;
};

// cycles the value of cell for a given the output
// of the given state
const cycleValue = (
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*boolean*/reverse,
  state
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

// try to create a loop from startCell to targetCell
//
// this does not create a persistent loop but just an transient
// one for preview purposes.
//
// this transient loop can be removed again via `stopTryLoop(state)`
//
// allOutputs - if the loop should be created across all
//              outputs or only for the currently selected output
const tryLoop = ({startCell, targetCell, allOutputs, state}) =>
  state.set('currentLoop',
    KVD.kvLoop({
      color: generateUnique(
        loopColor,
        state.diagram.loops
        .map((loop) => loop.color)
        .toSet()
      ),
      cube: KVD.newCubeFromTo(
        startCell, targetCell, state.diagram.inputs.size
      ),
      outputs: allOutputs ?
        I.Set(state.diagram.outputs.keys()) : I.Set.of(state.currentOutput),
      mode: state.currentKvMode,
    })
  )
;

// stop trying to create a loop
const stopTryLoop = (state) =>
  state
  .set('currentLoop', KVD.kvLoop())
;

// remove the loop at the given index
//
// allOutputs - if the loop should be removed from all outputs
//              or only from the currently selected one
const removeLoop = (loopIndex, allOutputs, state) =>
  state.update('diagram', (diagram) =>
    allOutputs ? KVD.removeLoop(loopIndex, diagram) :
      KVD.removeLoopFromOutput(loopIndex, state.currentOutput, diagram)
  )
;

// crate a loop from startCell to endCell for output of given index
//
// if allMatchingOutputs is true the loop will also be created for all other
// outputs if possible ie if their function values allow the loop exist.
const addLoop = ({
  outputIndex, startCell, targetCell,
  allMatchingOutputs = true,
  state,
}) => {
  const newCube = KVD.newCubeFromTo(
    startCell, targetCell, state.diagram.inputs.size
  );
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
        loopColor,
        diagram.loops
        .map((loop) => loop.color)
        .toSet()
      ),
      cube: newCube,
      outputs: outputs,
      mode: state.currentKvMode,
    }), diagram)
  );
};

// create a new output to the state's Karnaugh map
const addOutput = (state) => {
  const newDiagram = KVD.appendOutput(
    generateUnique(
      outputName,
      state.diagram.outputs
      .map((output) => output.name)
      .toSet()
    ),
    state.diagram
  );

  return state.merge({
    diagram: newDiagram,
    currentOutput: newDiagram.outputs.size - 1,
  });
};

// remove the output at the given index from the state's Karnaugh map
const removeOutput = (outputIndex, state) =>
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

// select the output at the given index
const selectOutput = (outputIndex, state) =>
  state.set('currentOutput',
    clamp(outputIndex, 0, state.diagram.outputs.size - 1))
;

// set the state's kv mode to either 'knf' or 'dnf'
const switchKvMode = (mode, state) =>
  state.set('currentKvMode', KVD.modeFromName(mode))
;

// set the state's edit mode to either 'function' or 'loops'
const switchEditMode = (mode, state) =>
  state.set('currentEditMode', mode)
;

// begin renaming the output of given index
const startRename = (outputIndex, state) =>
  state
    .merge({
      renameOutput: outputIndex,
      renameOutputValue:
        state.diagram.outputs.get(outputIndex).name,
      renameOutputValid: true,
    })
;

// cancel renaming the output
const cancelRename = (state) =>
  state
    .remove('renameOutput')
    .remove('renameOutputValue')
    .remove('renameOutputValid')
;

// confirm the current renaming of the output
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

// try reanming the output at given index
const tryOutputName = (outputIndex, newName, state) =>
  state
    .merge({
      renameOutput: outputIndex,
      renameOutputValue: newName,
      renameOutputValid: KVD.isValidOutputName(newName),
    })
;

// import the given json as Karnaugh map
const openDiagram = (jsonDiagram, state) => {
  try {
    const parsed = JSON.parse(jsonDiagram);
    const openedDiagram = KVD.fromJSON(parsed);
    if (openedDiagram) {
      return state
        .merge({
          diagram: openedDiagram,
          currentOutput: 0,
        });
    }
  } catch (e) {
  }

  return state.set('errorMessage', 'InvalidData');
};

// import the given logic network as Karnaugh map
const importExpression = (logicNetwork, state) => {
  try {
    const diagram = expressionImport(logicNetwork, MAX_INPUTS, MAX_OUTPUTS);
    return state
      .set('diagram', diagram)
      .set('currentOutput', 0);
  } catch (e) {
    return state.set('errorMessage', e.message);
  }
};

const setViewSetting = (viewSetting, state) =>
  state.set('viewSetting', viewSetting)
;

const modifiers = (actions) => {
  return O.merge([
    actions.addInput$.map(() =>
      compose(cancelRename, addInput)
    ),
    actions.removeInput$.map(() =>
      compose(cancelRename, removeInput)
    ),
    actions.cycleValue$.map(({output, cell, reverse}) => (state) =>
      cycleValue(output, cell, reverse, cancelRename(state))
    ),
    actions.tryLoop$.map(({
      startCell, targetCell,
      allOutputs = true,
    }) => (state) => {
      return tryLoop({startCell, targetCell, allOutputs, state});
    }),
    actions.stopTryLoop$.map(() => (state) => {
      return stopTryLoop(state);
    }),
    actions.removeLoop$.map(({loopIndex, allOutputs}) => (state) => {
      return removeLoop(loopIndex, allOutputs, state);
    }),
    actions.addLoop$.map(({
      output, startCell, targetCell,
      allOutputs = true,
    }) => (state) => {
      return addLoop({
        outputIndex: output,
        startCell, targetCell,
        allMatchingOutputs: allOutputs,
        state,
      });
    }),
    actions.addOutput$.map(() =>
      compose(cancelRename, addOutput)
    ),
    actions.removeOutput$.map((index) => (state) => {
      return removeOutput(index, cancelRename(state));
    }),
    actions.removeLastOutput$.map(() => (state) => {
      return removeOutput(state.diagram.outputs.size - 1, cancelRename(state));
    }),
    actions.selectOutput$.map((index) => (state) => {
      return selectOutput(index, cancelRename(state));
    }),
    actions.switchKvMode$.map((mode) => (state) => {
      return switchKvMode(mode, cancelRename(state));
    }),
    actions.switchEditMode$.map((mode) => (state) => {
      return switchEditMode(mode, cancelRename(state));
    }),
    actions.startRename$.map((outputIndex) => (state) => {
      return startRename(outputIndex, state);
    }),
    actions.cancelRename$.map(() => (state) => {
      return cancelRename(state);
    }),
    actions.confirmOutputName$.map(() => (state) => {
      return confirmOutputName(state);
    }),
    actions.tryOutputName$.map(({outputIndex, name}) => (state) => {
      return tryOutputName(outputIndex, name, state);
    }),
    actions.openDiagram$.map((data) => (state) => {
      return openDiagram(data, cancelRename(state));
    }),
    actions.importExpression$.map((data) => (state) => {
      return importExpression(data, cancelRename(state));
    }),
    actions.setViewSetting$.map((viewSetting) => (state) => {
      return setViewSetting(viewSetting, cancelRename(state));
    }),
  ]);
};

const initialState = kvState();

const stateFromJson = (json) =>
  kvState({
    currentEditMode: json.currentEditMode,
    currentKvMode: KVD.modeFromName(String(json.mode)),
    currentOutput: json.currentOutput,
    diagram: KVD.fromJSON(json),
  })
;

const applyModification = (prev, modfn) => {
  return modfn(clearError(prev));
};

export default (initial$, actions) =>
  initial$
  .map(stateFromJson)
  .startWith(initialState)
  .map((initial) =>
    modifiers(actions)
    .startWith(initial)
    .scan(applyModification)
    .distinctUntilChanged(
      (s) => s,
      (a,b) => a === b
    )
    .map((state) => ({
      state: state,
      layout: layout(state.diagram.inputs.size),
    }))
  )
  .switch()
  .shareReplay(1)
;
