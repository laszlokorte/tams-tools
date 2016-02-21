import {svg} from '@cycle/dom';

import './machine.styl';

export default (machine) =>
  svg('svg', {
    attributes: {
      width: 200,
      height: 100,
      class: 'graphics-root',
      viewBox: '0 0 200 200',
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
          height: 100,
          class: 'fsm-block-delta',
        },
      }),

      svg('text', {
        class: 'fsm-block-label',
        transform: 'translate(50, 15)',
        x: 0,
        y: 75,
        'text-anchor': 'middle',
        'dominant-baseline': 'auto',
        fill: 'white',
      }, 'Delta Schaltnetz'),
    ]),

    svg('g', {
      transform: 'translate(50, 160)',
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
    ]),

    svg('g', {
      transform: 'translate(180, 10)',
    }, [
      svg('rect', {
        attributes: {
          x: 0,
          y: 0,
          width: 30,
          height: 100,
          class: 'fsm-block-lambda',
        },
      }),
      svg('text', {
        class: 'fsm-block-label',
        transform: 'translate(14, 50) rotate(-90)',
        x: 0,
        y: 0,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: 'white',
      }, 'Lambda Schaltnetz'),
    ]),

    svg('path', {
      d: 'M155,140 L180,140 L180,175 L160,175',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    svg('path', {
      d: 'M45,175 L20,175 L20,140 L40,140',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    svg('path', {
      d: 'M45,175 L20,175 L20,38 L170,38',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),

    svg('path', {
      d: 'M0,175 L0,15 L170,15',
      class: 'arrow-line',
      style: {
        fill: 'none',
        markerEnd: 'url(#markerArrow)',
      },
    }),
  ])
;
