import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {ul, div, li, a} from '@cycle/dom';

import './index.styl';

// The list of links to be shown on the home page
const COMPONENTS = [
  {
    name: 'Karnaugh map editor',
    url: './kvd-editor.html',
  },
  {
    name: 'Logic expression editor',
    url: './logic-editor.html',
  },
  {
    name: 'Logic Checker',
    url: './logic-checker.html',
  },
  {
    name: 'LED editor',
    url: './led-editor.html',
  },
  {
    name: 'FSM editor',
    url: './fsm-editor.html',
  },
  {
    name: 'Number circle',
    url: './number-circle.html',
  },
];

const home = () => ({
  DOM: O.just(
    div([
      ul('.tile-grid', COMPONENTS.map((component) =>
        li('.tile-item', a('.tile-link', {
          href: component.url,
        }, component.name))
      )),
    ])
  ),
});

const drivers = {
  DOM: makeDOMDriver('#app'),
};

Cycle.run(home, drivers);

