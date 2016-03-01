import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

const renderCircle = (angles) =>
  svg('svg', {
    attributes: {
      width: 200,
      height: 200,
      class: 'graphics-root',
      viewBox: `0 0 500 500`,
      preserveAspectRatio: 'xMidYMid meet',
    },
  }, angles.map((angle) =>
    svg('circle', {
      cx: 250 + Math.sin(angle) * 200,
      cy: 250 + Math.cos(angle) * 200,
      r: 50,
    }))
  )
;

// convert array of angles into svg
const render = (state) =>
  div([
    div(['Number of bits:', state.bitCount]),
    renderCircle(state.angles),
  ])
;

// generate array of angles for a number circle of
// given bitCount.
const angleArray = (bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, all) => 2 * Math.PI * index / all.length)
;

const model = (initialBitCount) =>
  // number of bits to generate the number circle for
  O.just(initialBitCount)
  // convert number of bit's into array of angles
  .map((bitCount) => ({
    bitCount,
    angles: angleArray(bitCount),
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
