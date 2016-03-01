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

    return svg('path', {
      class: 'selection-arc',
      d: `M ${center} ${center - radius}
          A ${radius} ${radius} 0
          ${mid ? 1 : 0} 1
          ${x + center} ${y + center}`,
      fill: 'none',
      'stroke-width': 10,
    });
  })
;

const renderDots = (dots, selected = null) => {
  const dotRadius = 50;
  const radius = 150 * Math.sqrt(dots.length);
  const size = 2 * (radius + dotRadius);
  const center = size / 2;

  return svg('svg', {
    attributes: {
      width: 500,
      height: 500,
      class: 'number-circle',
      viewBox: `0 0 ${size} ${size}`,
      preserveAspectRatio: 'xMidYMid meet',
    },
  }, [
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
    ])),
    renderArc(dots, selected, size, radius - dotRadius * 1.5),
  ]);
};

const renderButtons = (state) => div('.button-bar',[
  button('.bit-button', {
    attributes: {
      'data-action': 'remove-bit',
    },
    disabled: state.canRemoveBits ? void 0 : 'true',
  }, 'Remove Bit'),

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

// generate array of angles for a number circle of
// given bitCount.
const dotArray = (bitCount) =>
  Array
  // init array of length 2^bits.
  .apply(Array, {length: Math.pow(2, bitCount)})
  // map array to angles
  .map((_, index, all) => ({
    angle: 2 * Math.PI * index / all.length,
    value: index >= all.length / 2 ? index - all.length : index,
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
    bitCount,
    dots: dotArray(bitCount),
    selected,
    canAddBits: bitCount < 6,
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
