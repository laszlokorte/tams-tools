import {Observable as O} from 'rx';
import I from 'immutable';

import * as diagram from './diagram';
import {buildLayout} from './layout';

import {memoize} from '../../../lib/utils';

const kvState = I.Record({
  currentMode: 'edit',
  currentCube: diagram.newLoop(),
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

const layout = memoize(buildLayout);

const applyModification = (prev, modfn) => modfn(prev);

const addInput = (state) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: diagram.appendInput(
      "New Input",
      state.diagram
    ),
  })
;

const removeInput = (state) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
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
    currentMode: state.currentMode,
    currentCube: state.currentCube,
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

const tryLoop = (state) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: state.diagram,
  })
;

const removeLoop = (state, loopIndex) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: diagram.removeLoop(loopIndex, state.diagram),
  })
;

const addLoop = (state, output, start, end) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: diagram.appendLoop(diagram.kvLoop({
      color: 'green',
      cube: diagram.newCubeFromTo(start, end),
      outputs: I.Set.of(output),
      mode: diagram.modeFromName(state.currentMode),
    }), state.diagram),
  })
;

const addOutput = (state) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: diagram.appendOutput(
      "New Output",
      state.diagram
    ),
  })
;

const removeOutput = (state, outputIndex) =>
  kvState({
    currentMode: state.currentMode,
    currentCube: state.currentCube,
    diagram: diagram.removeOutput(
      outputIndex,
      state.diagram
    ),
  })
;

const switchMode = (state, mode) =>
  kvState({
    currentMode: mode,
    currentCube: state.currentCube,
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
    actions.tryLoop$.map(({output, startCell, targetCell}) => (state) => {
      return tryLoop(state, output, startCell, targetCell);
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
    actions.switchMode$.map((mode) => (state) => {
      return switchMode(state, mode);
    })
  );
};

const initialState = kvState();

const stateFromJson = (json) =>
  kvState({
    currentMode: String(json.mode),
    currentCube: diagram.cubeFromJson(json.cube),
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
