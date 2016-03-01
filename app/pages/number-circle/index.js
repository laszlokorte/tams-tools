import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

// convert array of angles into svg
const render = (angles) =>
  div([
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
    ),
  ])
;

const numberCircleApp = (sources) => {
  const state$ = // number of bits to generate the number circle for
    O.just(3)
    // convert number of bit's into array of angles
    .map((bits) =>
      Array
        // init array of length 2^bits.
        .apply(Array, {length: Math.pow(2, bits)})
        // map array to angles
        .map((_, index, all) => 2 * Math.PI * index / all.length)
    );

  return {
    DOM: state$.map(render),
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
