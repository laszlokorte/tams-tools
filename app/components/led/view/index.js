import {Observable as O} from 'rx';
import {div, svg, input} from '@cycle/dom';

import './index.styl';

const signaleAsString = (state) => {
  if (state === true) {
    return 'enabled';
  } else if (state === false) {
    return 'disabled';
  } else {
    return 'undefined';
  }
};

const render = (state, table) =>
  div([
    input('.number-field', {
      placeholder: 'Decimal',
      type: 'number',
      value: state.decimal,
      min: 0,
      max: Math.pow(2, state.switches.length) - 1,
    }),
    div([
      svg('svg', {
        attributes: {
          width: 400,
          height: 400,
          class: 'graphics-root',
          viewBox: '0 0 400 200',
          preserveAspectRatio: 'xMidYMin meet',
        },
      }, [
        svg('g', {
          transform: 'translate(90, 20)',
        }, state.switches.map((s, i) => [
          svg('circle', {
            attributes: {
              'data-switch': i,
              class: 'switch-button' + (s.enabled ? ' state-enabled' : ''),
              cx: 20 + 40 * i,
              cy: 20,
              r: 15,
            },
          }),
          svg('text', {
            x: 20 + 40 * i,
            y: 55,
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
          }, s.name),
        ])),
        svg('g', {
          transform: 'translate(100, 100)',
        },
          state.leds.map((led, i) => {
            const stateClass = 'state-' + signaleAsString(led.enabled);
            return svg('path', {
              attributes: {
                'data-led': i,
                class: 'led ' + stateClass,
                d: led.path,
              },
            });
          }
          )
        ),
      ]),
    ]),
    table,
  ])
;

export default (state$, table$) =>
  O.combineLatest(state$, table$, render)
;
