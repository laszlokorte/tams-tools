import {Observable as O} from 'rx';
import I from 'immutable';

import * as diagram from './diagram';
import {buildLayout} from './layout';

import {memoize} from '../../lib/utils';

const kvState = I.Record({
  currentMode: 'edit',
  currentLoop: diagram.newLoop(),
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
    currentLoop: state.currentLoop,
    diagram: diagram.appendInput(
      "New Input",
      state.diagram
    ),
  })
;

const removeInput = (state) =>
  kvState({
    currentMode: state.currentMode,
    currentLoop: state.currentLoop,
    diagram: diagram.popInput(
      state.diagram
    ),
  })
;

const nextValue = (
  /*mixed*/currentValue,
  /*boolean*/reverse
  ) => {
  const prevValue = (currentValue === false) ? null : !currentValue;
  const nextValue = (currentValue === true) ? null : currentValue === false;

  return reverse ? prevValue : nextValue;
};

const cycleValue = (
  state,
  /*int*/outputIndex,
  /*BitSet*/cell,
  /*boolean*/reverse
  ) =>
  kvState({
    currentMode: state.currentMode,
    currentLoop: state.currentLoop,
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

;

const removeLoop = (state) =>

;

const addLoop = (state) =>

;

const addOutput = (state) =>

;

const removeOutput = (state) =>

;

const selectOutput = (state) =>

;

const switchMode = (state) =>

;


const modifiers = (actions) => {
  return O.merge(
    actions.addInput$.map(() => (state) => {
      return addInput(state);
    }),
    actions.removeInput$.map(() => (state) => {
      return removeInput(state);
    }),
    actions.cycleValue$.map(({output, offset, reverse}) => (state) => {
      return cycleValue(state, output, offset, reverse);
    }),
    actions.tryLoop$.map(({output, startOffset, targetOffset}) => (state) => {
      return tryLoop(state, output, startOffset, targetOffset);
    }),
    actions.removeLoop$.map((loopIndex) => (state) => {
      return removeLoop(state, loopIndex);
    }),
    actions.addLoop$.map(({output, startOffset, targetOffset}) => (state) => {
      return addLoop(state, output, startOffset, targetOffset);;
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
    currentMode: String(json.mode),
    currentLoop: diagram.loopFromJson(json.loop),
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
      layout: layout(state.diagram.inputs.count()),
    }))
;
