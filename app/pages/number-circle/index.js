import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

const renderDots = (dots) =>
  svg('svg', {
    attributes: {
      width: 200,
      height: 200,
      class: 'graphics-root',
      viewBox: `0 0 500 500`,
      preserveAspectRatio: 'xMidYMid meet',
    },
  }, dots.map((dot) => [
    svg('circle', {
      cx: 250 + Math.sin(dot.angle) * 200,
      cy: 250 - Math.cos(dot.angle) * 200,
      r: 50,
      fill: '#444',
    }),
    svg('text', {
      x: 250 + Math.sin(dot.angle) * 200,
      y: 250 - Math.cos(dot.angle) * 200,
      fill: '#fff',
      'font-size': '50px',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    }, dot.value.toString()),
  ]))
;

const renderButtons = (state) => div([
  button({
    attributes: {
      'data-action': 'add-bit',
    },
  }, 'Add Bit'),

  button({
    attributes: {
      'data-action': 'remove-bit',
    },
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

const model = (initialBitCount) =>
  // number of bits to generate the number circle for
  O.just(initialBitCount)
  // convert number of bit's into array of angles
  .map((bitCount) => ({
    bitCount,
    dots: dotArray(bitCount),
  }))
;

const view = (state$) =>
  state$.map(render)
;

const numberCircleApp = (sources) => {
  const state$ = model(3);
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
