import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

const renderDots = (dots) => {
  const dotRadius = 50;
  const radius = 150 * Math.sqrt(dots.length);
  const size = 2 * (radius + dotRadius);
  const center = size / 2;
  return svg('svg', {
    attributes: {
      width: 500,
      height: 500,
      class: 'graphics-root',
      viewBox: `0 0 ${size} ${size}`,
      preserveAspectRatio: 'xMidYMid meet',
    },
  }, dots.map((dot) => [
    svg('circle', {
      cx: center + Math.sin(dot.angle) * radius,
      cy: center - Math.cos(dot.angle) * radius,
      r: 50,
      fill: '#444',
    }),
    svg('text', {
      x: center + Math.sin(dot.angle) * radius,
      y: center - Math.cos(dot.angle) * radius,
      fill: '#fff',
      'font-size': '50px',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    }, dot.value.toString()),
  ]));
};

const renderButtons = (state) => div([
  button({
    attributes: {
      'data-action': 'add-bit',
    },
    disabled: state.canAddBits ? void 0 : 'true',
  }, 'Add Bit'),

  button({
    attributes: {
      'data-action': 'remove-bit',
    },
    disabled: state.canRemoveBits ? void 0 : 'true',
  }, 'Remove Bit'),
]);

// convert array of angles into svg
const render = (state) =>
  div([
    div(['Number of bits:', state.bitCount]),
    renderButtons(state),
    renderDots(state.dots),
  ])
;

// generate array of angles for a number circle of
// given bitCount.
const dotArray = (bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, all) => ({
    angle: 2 * Math.PI * index / all.length,
    value: index,
  }))
;

const intent = (DOM) => {
  return {
    addBit$: DOM.select('[data-action="add-bit"]').events('click'),
    removeBit$: DOM.select('[data-action="remove-bit"]').events('click'),
  };
};

const model = (initialBitCount, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
      ({bitCount: state.bitCount + 1})
    ),
    actions.removeBit$.map(() => (state) =>
      ({bitCount: state.bitCount - 1})
    ),
  ]);

  return modifierFunction$
  // number of bits to generate the number circle for
  .startWith({bitCount: initialBitCount})
  // apply the function
  .scan((state, modifierFunction) => modifierFunction(state))
  // convert number of bit's into array of angles
  .map(({bitCount}) => ({
    bitCount,
    dots: dotArray(bitCount),
    canAddBits: bitCount < 6,
    canRemoveBits: bitCount > 1,
  }));
};

const view = (state$) =>
  state$.map(render)
;

const numberCircleApp = (sources) => {
  const actions = intent(sources.DOM);
  const state$ = model(3, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
