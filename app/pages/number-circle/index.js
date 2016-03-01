import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

const numberCircleApp = (sources) => {
  return {
    DOM: O.just(
      div([
        svg('svg', {
          attributes: {
            width: 200,
            height: 200,
            class: 'graphics-root',
            viewBox: `0 0 500 500`,
            preserveAspectRatio: 'xMidYMid meet',
          },
        }, [
          svg('circle', {
            cx: 50,
            cy: 50,
            r: 50,
          }),
        ]),
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
