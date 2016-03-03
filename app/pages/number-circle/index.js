import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, button, svg} from '@cycle/dom';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

import {IF} from '../../lib/h-helper';

import './index.styl';

const renderArc = (dots, selected, size, radius) =>
  IF(selected !== null, () => {
    const dot = dots[selected];
    const angle = dot.angle;
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;
    const center = size / 2;
    const mid = angle > Math.PI;
    const midAngle = dots[dots.length / 2 - 1].angle;
    const reverse = angle > midAngle;

    return svg('path', {
      class: 'selection-arc',
      d: `M ${center} ${center - radius}
          A ${radius} ${radius} 0
          ${mid !== reverse ? 1 : 0} ${reverse ? 0 : 1}
          ${x + center} ${y + center}`,
      fill: 'none',
      'stroke-width': 10,
      'marker-end': 'url(#markerArrow)',
    });
  })
;

// the the horizontal offset for text at the given angle
// (in radians)
const textAnchor = (angle) => {
  const sin = Math.sin(angle);

  if (sin > 0.01) {
    return 'start';
  } else if (sin < -0.01) {
    return 'end';
  } else {
    return 'middle';
  }
};

// get the vertical offset for text at the given angle
// (in radians)
const baseLine = (angle) => {
  const cos = -Math.cos(angle);

  if (cos > 0.01) {
    return 'text-before-edge';
  } else if (cos < -0.01) {
    return 'text-after-edge';
  } else {
    return 'central';
  }
};

// render the dots as svg element
const renderDots = (dots, selected = null) => {
  const dotRadius = 50;
  const radius = 150 * Math.sqrt(dots.length);
  const size = 2 * (radius + dotRadius);
  const center = size / 2;
  const padding = 100;

  const overflowAngle = (
  dots[
    Math.floor((dots.length - 1) / 2)
  ].angle +
  dots[
    Math.ceil((dots.length - 1) / 2)
  ].angle
  ) / 2;

  return svg('svg', {
    attributes: {
      width: 500,
      height: 500,
      class: 'number-circle',
      viewBox: `
        ${-padding}
        ${-padding}
        ${size + 2 * padding}
        ${size + 2 * padding}
      `,
      preserveAspectRatio: 'xMidYMid meet',
    },
  }, [
    svg('defs', [
      svg('marker', {
        id: 'markerArrow',
        markerWidth: 3,
        markerHeight: 4,
        refX: 2,
        refY: 2,
        orient: 'auto',
        class: 'arrow-head',
      }, [
        svg('path', {
          d: 'M0,0 L0,4 L3,2 L0,0',
        }),
      ]),
    ]),
    dots.map((dot, dotIndex) => svg('g', {
      attributes: {
        class: 'number-dot' +
          (selected === dotIndex ? ' state-selected' : ''),
        'data-dot-index': dotIndex,
      },
    }, [
      svg('circle', {
        class: 'number-dot-background',
        cx: center + Math.sin(dot.angle) * radius,
        cy: center - Math.cos(dot.angle) * radius,
        r: 50,
      }),
      svg('text', {
        class: 'number-dot-label',
        x: center + Math.sin(dot.angle) * radius,
        y: center - Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
      svg('text', {
        class: 'number-dot-pattern',
        x: center + Math.sin(dot.angle) * (radius * 1 + 70),
        y: center - Math.cos(dot.angle) * (radius * 1 + 70),
        fill: '#000',
        'font-size': '50px',
        'text-anchor': textAnchor(dot.angle),
        'dominant-baseline': baseLine(dot.angle),
      }, dot.pattern.toString()),
    ])),
    renderArc(dots, selected, size, radius - dotRadius * 1.5),
    svg('line', {
      class: 'overflow-line',
      x1: center,
      y1: center,
      x2: center + Math.sin(overflowAngle) * (radius + dotRadius * 3),
      y2: center - Math.cos(overflowAngle) * (radius + dotRadius * 3),
      stroke: 'black',
      'stroke-width': '10',
    }),
  ]);
};

const renderButtons = (state) => div('.button-bar',[
  // The button for removing a bit
  button('.bit-button', {
    attributes: {
      'data-action': 'remove-bit',
    },
    disabled: state.canRemoveBits ? void 0 : 'true',
  }, 'Remove Bit'),

  // The button for adding a bit
  button('.bit-button', {
    attributes: {
      'data-action': 'add-bit',
    },
    disabled: state.canAddBits ? void 0 : 'true',
  }, 'Add Bit'),
]);

// convert array of angles into svg
const render = (state) =>
  div('.number-circle-container', [
    div('.bit-count', ['Number of bits: ', state.bitCount]),
    renderButtons(state),
    renderDots(state.dots, state.selected),
  ])
;

// convert numbert into bit pattern string of length
// bitCount.
const bitPattern = (number, bitCount) =>
  Array
    .apply(Array, {length: bitCount})
    .map((__, b) =>
      (1 << (bitCount - b - 1)) & number ? 1 : 0
    ).join('')
;

const intValue = (number, bitCountPow2) =>
  number >= bitCountPow2 / 2 ? number - bitCountPow2 : number
;

// generate array of angles for a number circle of
// given bitCount.
const dotArray = (bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, {length}) => ({
    angle: 2 * Math.PI * index / length,
    value: intValue(index, length),
    pattern: bitPattern(index, bitCount),
  }))
;

const intent = (DOM) => {
  return {
    addBit$: DOM.select('[data-action="add-bit"]').events('click'),
    removeBit$: DOM.select('[data-action="remove-bit"]').events('click'),

    selectBit$: DOM.select('[data-dot-index]')
      .events('click').map(
        (evt) => parseInt(evt.ownerTarget.getAttribute('data-dot-index'), 10)
      ),
  };
};

const model = (initialBitCount, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
      ({bitCount: state.bitCount + 1})
    ),
    actions.removeBit$.map(() => (state) =>
      ({bitCount: state.bitCount - 1})
    ),
    actions.selectBit$.map((bitIndex) => (state) =>
      ({bitCount: state.bitCount, selected: bitIndex})
    ),
  ]);

  return modifierFunction$
  // number of bits to generate the number circle for
  .startWith({bitCount: initialBitCount, selected: null})
  // apply the function
  .scan((state, modifierFunction) => modifierFunction(state))
  // convert number of bit's into array of angles
  .map(({bitCount, selected}) => ({
    // number of bits
    bitCount,
    // the dots to draw
    dots: dotArray(bitCount),
    // the index of the selected dot
    selected,
    // boolean if more bits can be added
    canAddBits: bitCount < 5,
    // boolean fi a bit can be removed
    canRemoveBits: bitCount > 1,
  }));
};

const view = (state$) =>
  state$.map(render)
;

const numberCircleApp = (sources) => {
  const actions = intent(sources.DOM);
  const state$ = model(3, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
