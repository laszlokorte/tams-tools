import {svg} from '@cycle/dom';

import './machine.styl';
import {TYPE_MEALY} from '../lib/state-machine';

const PORT_HEIGHT = 18;

export default (machine, editable) => {
  const deltaNetworkHeight = Math.max(
    100, PORT_HEIGHT * machine.inputs.size + 2 * PORT_HEIGHT
  );

  const lambdaNetworkHeight = Math.max(
    100, PORT_HEIGHT * machine.outputs.size + PORT_HEIGHT
  );

  const svgHeight = Math.max(
    deltaNetworkHeight + 100,
    lambdaNetworkHeight + 50
  );

  return svg('svg', {
    attributes: {
      width: 200,
      height: svgHeight / 2,
      class: 'graphics-root',
      viewBox: `0 0 235 ${svgHeight}`,
      preserveAspectRatio: 'xMidYMin meet',
    },
  }, [

    svg('defs', [
      svg('marker', {
        id: 'markerArrow',
        markerWidth: 3,
        markerHeight: 4,
        refX: 1,
        refY: 2,
        orient: 'auto',
        class: 'arrow-head',
      }, [
        svg('path', {
          d: 'M0,0 L0,4 L3,2 L0,0',
        }),
      ]),
    ]),

    svg('g', {
      transform: 'translate(50, 50)',
    }, [
      svg('rect', {
        attributes: {
          x: 0,
          y: 0,
          width: 100,
          height: deltaNetworkHeight,
          class: 'fsm-block-delta',
        },
      }),

      svg('text', {
        class: 'fsm-block-label',
        transform: 'translate(50, 15)',
        x: 0,
        y: deltaNetworkHeight - 25,
        'text-anchor': 'middle',
        'dominant-baseline': 'auto',
        fill: 'white',
      }, 'Delta Schaltnetz'),
    ]),

    svg('g', {
      transform: `translate(50, ${60 + deltaNetworkHeight})`,
    }, [
      svg('rect', {
        attributes: {
          x: 0,
          y: 0,
          width: 100,
          height: 30,
          class: 'fsm-block-clock',
        },
      }),

      svg('text', {
        class: 'fsm-block-label',
        transform: 'translate(50, 15)',
        x: 0,
        y: 0,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: 'white',
      }, 'Taktglied'),

      editable ? void 0 :
      svg('g', {
        class: 'fsm-button-tick',
        'data-fsm-action': 'tick',
      }, [
        svg('rect', {
          attributes: {
            x: 0,
            y: 0,
            width: 100,
            height: 30,
            class: 'fsm-button-background',
          },
        }),

        svg('text', {
          class: 'fsm-block-label',
          transform: 'translate(50, 15)',
          x: 0,
          y: 0,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: 'white',
        }, 'Takt!'),
      ]),
    ]),

    svg('g', {
      transform: 'translate(190, 10)',
    }, [
      svg('rect', {
        attributes: {
          x: 0,
          y: 0,
          width: 30,
          height: lambdaNetworkHeight,
          class: 'fsm-block-lambda',
        },
      }),
      svg('text', {
        class: 'fsm-block-label',
        transform: `translate(14, ${lambdaNetworkHeight/2}) rotate(-90)`,
        x: 0,
        y: 0,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: 'white',
      }, 'Lambda Schaltnetz'),
    ]),

    svg('path', {
      transform: `translate(0, ${deltaNetworkHeight})`,
      d: 'M155,40 L175,40 L175,75 L160,75',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    svg('path', {
      transform: `translate(0, ${deltaNetworkHeight})`,
      d: 'M45,75 L20,75 L20,40 L40,40',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    svg('path', {
      d: `M45,${deltaNetworkHeight + 75} L20,${deltaNetworkHeight + 75} L20,38 L180,38`,
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    machine.type === TYPE_MEALY ?
    svg('path', {
      d: `M0,${deltaNetworkHeight + 75} L0,15 L180,15`,
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }) : void 0,

    machine.inputs.map((input, i) =>
      svg('g', {
        transform: `translate(0, ${60 + PORT_HEIGHT * i})`,
        class: 'fsm-port-input-container',
      }, [
        svg('g', {
          class: 'fsm-port-input',
        }, [
          svg('path', {
            d: 'M0,0 L50,0',
            class: 'fsm-port-input-wire',
          }),
          svg('circle', {
            class: 'fsm-port-input-soder',
            cx: 0,
            cy: 0,
            r: 4,
          }),

          editable ? svg('circle', {
            attributes: {
              'data-fsm-remove-input': i,
            },
            class: 'fsm-port-button-remove',
            cx: 0,
            cy: 0,
            r: 7,
          }) : void 0,
        ]),

        svg('text', {
          class: 'fsm-port-label fsm-port-input-label',
          x: -14,
          y: 0,
          'text-anchor': 'end',
          'dominant-baseline': 'middle',
        }, input.name),
      ])
    ).toArray(),

    editable ? svg('g', {
      attributes: {
        'data-fsm-action': 'add-input',
      },
      transform: `translate(0, ${65 + PORT_HEIGHT * machine.inputs.size})`,
      class: 'fsm-button',
    }, [
      svg('rect', {
        class: 'fsm-button-background',
        x: -60,
        y: -PORT_HEIGHT / 2,
        width: 70,
        height: PORT_HEIGHT,
        rx: 5,
        ry: 5,
      }),
      svg('text', {
        class: 'fsm-button-label',
        x: -14,
        y: 1,
        'text-anchor': 'end',
        'dominant-baseline': 'middle',
      }, 'Add Input'),
    ]) : void 0,

    machine.outputs.map((output, i) =>
      svg('g', {
        transform: `translate(220, ${25 + PORT_HEIGHT * i})`,
        class: 'fsm-port-output-container',
      }, [
        svg('g', {
          class: 'fsm-port-output',
        }, [
          svg('path', {
            d: 'M0,0 L20,0',
            class: 'fsm-port-output-wire',
          }),
          svg('circle', {
            class: 'fsm-port-output-soder',
            cx: 20,
            cy: 0,
            r: 4,
          }),

          editable ? svg('circle', {
            attributes: {
              'data-fsm-remove-output': i,
            },
            class: 'fsm-port-button-remove',
            cx: 20,
            cy: 0,
            r: 7,
          }) : void 0,
        ]),

        svg('text', {
          class: 'fsm-port-label fsm-port-output-label',
          x: 30,
          y: 0,
          'text-anchor': 'start',
          'dominant-baseline': 'middle',
        }, output.name),
      ])
    ).toArray(),

    editable ? svg('g', {
      attributes: {
        'data-fsm-action': 'add-output',
      },
      transform: `translate(220, ${25 + PORT_HEIGHT * machine.outputs.size})`,
      class: 'fsm-button',
    }, [
      svg('rect', {
        class: 'fsm-button-background',
        x: 10,
        y: -PORT_HEIGHT / 2,
        width: 73,
        height: PORT_HEIGHT,
        rx: 5,
        ry: 5,
      }),
      svg('text', {
        class: 'fsm-button-label',
        x: 30,
        y: 1,
        'text-anchor': 'start',
        'dominant-baseline': 'middle',
      }, 'Add Output'),
    ]) : void 0,
  ]);
}
;
