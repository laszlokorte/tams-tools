import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {ul, div, li, a, img} from '@cycle/dom';

import './index.styl';

const GITHUB_URL = 'https://github.com/laszlokorte/tams-tools';
// eslint-disable-next-line max-len
const GITHUB_BADGE_URL = 'https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67';
// eslint-disable-next-line max-len
const GITHUB_BADGE_URL_CANON = 'https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png';

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
    name: 'Logic checker',
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
      a({
        href: GITHUB_URL,
      }, [
        img({
          src: GITHUB_BADGE_URL,
          dataset: {
            canonicalSrc: GITHUB_BADGE_URL_CANON,
          },
          style: {
            position: 'absolute',
            top: 0,
            right: 0,
            border: 0,
          },
          alt: 'Fork me on GitHub',
        }),
      ]),
    ])
  ),
});

const drivers = {
  DOM: makeDOMDriver('#app'),
};

Cycle.run(home, drivers);

