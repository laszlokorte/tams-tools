import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

const numberCircleApp = (sources) => {
  return {
    DOM: O.just([
      0,
      Math.PI / 2,
      Math.PI,
      Math.PI * 3 / 2,
    ]).map((angles) =>
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
    ),
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
