import {Observable as O} from 'rx';
import {div, svg, input, button} from '@cycle/dom';

import openIcon from '../../../icons/open';
import exportIcon from '../../../icons/export';
import helpIcon from '../../../icons/help';

import './index.styl';

const signalAsString = (state) => {
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
    div('.action-panel', [
      div('.action-list', [
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'open'},
            title: 'Open Diagram...',
          }, openIcon(24)),
        ]),
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'save'},
            title: 'Export Diagram...',
          }, exportIcon(24)),
        ]),
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'help'},
            title: 'Help...',
          }, helpIcon(24)),
        ]),
      ]),
    ]),
    div('.number-field-container', [
      "Input as decimal:",
      input('.number-field', {
        placeholder: 'Decimal',
        type: 'number',
        value: state.decimal,
        min: 0,
        max: Math.pow(2, state.switches.length) - 1,
      }),
    ]),
    div([
      svg('svg', {
        attributes: {
          width: 1200,
          height: 500,
          class: 'led-viewer',
          viewBox: '0 0 500 400',
          preserveAspectRatio: 'xMidYMin meet',
        },
      }, [
        svg('rect', {
          x: 0,
          y: 0,
          width: 500,
          height: 400,
          fill: '#444',
        }),
        svg('g', {
          transform: 'translate(130, 20)',
        }, [
          state.switches.map((s, i) => [
            svg('circle', {
              attributes: {
                'data-switch': i,
                class: 'switch-button' + (s.enabled ? ' state-enabled' : ''),
                cx: 40 + 40 * i,
                cy: 20,
                r: 15,
              },
            }),
            svg('text', {
              x: 40 + 40 * i,
              y: 55,
              'text-anchor': 'middle',
              'alignment-baseline': 'middle',
              fill: '#fff',
            }, s.name),
          ]),

          svg('text', {
            x: 0,
            y: 20,
            'text-anchor': 'end',
            'alignment-baseline': 'middle',
            fill: '#fff',
          }, "Input in binary:"),
        ]),
        svg('g', {
          transform: 'translate(170, 120)',
        },
          state.leds.map((led, i) => {
            const stateClass = 'state-' + signalAsString(led.enabled);
            return svg('g', [
              svg(led.shape.type, {
                attributes: {
                  'data-led': i,
                  class: 'led ' + stateClass,
                  points: led.shape.attributes.points,
                  cx: led.shape.attributes.cx,
                  cy: led.shape.attributes.cy,
                  r: led.shape.attributes.r,
                },
              }),
              svg('text', {
                attributes: {
                  class: 'led-label',
                  x: led.labelPosition.x,
                  y: led.labelPosition.y,
                  'text-anchor': 'middle',
                  'alignment-baseline': 'middle',
                  fill: '#fff',
                },
              }, led.name),
            ]);
          }
          )
        ),
      ]),
    ]),
    table,
  ])
;

export default (state$, table$, panels$) =>
  O.combineLatest(state$, table$, panels$,
    (state, table, panels) => div([
      panels,
      render(state, table),
    ])
  )
;
