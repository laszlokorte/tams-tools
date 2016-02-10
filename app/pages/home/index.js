import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {ul, div, li, a} from '@cycle/dom';

import './index.styl';

const home = (sources) => {
  const {
  } = sources;

  return {
    DOM: O.just(
      div([
        ul('.tile-grid', [
          li('.tile-item', a('.tile-link', {
            href: './kvd-editor.html',
          }, 'KV diagram editor')),
          li('.tile-item', a('.tile-link', {
            href: './logic-editor.html',
          }, 'Logic expression editor')),
          li('.tile-item', a('.tile-link', {
            href: './led-editor.html',
          }, 'LED editor')),
          li('.tile-item', a('.tile-link', {
            href: './fsm-editor.html',
          }, 'FSM editor')),
        ]),
      ])
    ),
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
};

Cycle.run(home, drivers);

