import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import {makeDOMDriver} from '@cycle/dom';
import {div, span, button} from '@cycle/dom';

import Circle from '../../components/number-circle';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {stopPropagationDriver} from '../../drivers/stop-propagation';
import {globalEventDriver} from '../../drivers/global-events';

import './index.styl';

const ENCODINGS = [
  {
    key: 'positive',
    label: 'Positive',
  },
  {
    key: 'signed',
    label: 'Signed',
  },
  {
    key: 'complement1',
    label: '1s Complement',
    short: '1s Comp',
  },
  {
    key: 'complement2',
    label: '2s Complement',
    short: '2s Comp',
  },
];

const renderBitButtons = (state) => div('.button-bar',[
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

const renderEncodingButtons = (state) => div('.button-bar',
  ENCODINGS.map((enc) =>
    button('.bit-button', {
      attributes: {
        'data-encoding': enc.key,
      },
      disabled: state.encoding !== enc.key ? void 0 : 'true',
    }, enc.short ? [
      span('.short-label', enc.short),
      span('.long-label', enc.label),
    ] : enc.label)
  )
);

// convert array of angles into svg
const render = (state, circle) =>
  div('.number-circle-container', [
    div('.number-circle-head', [
      div('.number-circle-head-left', [
        div('.bit-count', ['Number of bits: ', state.bitCount]),
        renderBitButtons(state),
      ]),
      div('.number-circle-head-right', [
        div('.bit-count', ['Encoding']),
        renderEncodingButtons(state),
      ]),
    ]),
    div('.number-circle-body', [
      circle,
    ]),
  ])
;

const intent = (DOM) => {
  return {
    addBit$: DOM
      .select('[data-action="add-bit"]')
      .events('click'),
    removeBit$: DOM
      .select('[data-action="remove-bit"]')
      .events('click'),
    setEncoding$: DOM
      .select('[data-encoding]')
      .events('click')
      .map((evt) => evt.ownerTarget.dataset.encoding),
  };
};

const model = ({initial: initialBitCount, max: maxBitCount}, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
      ({bitCount: state.bitCount + 1, encoding: state.encoding})
    ),
    actions.removeBit$.map(() => (state) =>
      ({bitCount: state.bitCount - 1, encoding: state.encoding})
    ),
    actions.setEncoding$.map((encoding) => (state) =>
      ({bitCount: state.bitCount, encoding})
    ),
  ]).share();

  return modifierFunction$
  // number of bits to generate the number circle for
  .startWith({bitCount: initialBitCount, encoding: 'positive'})
  // apply the function
  .scan((state, modifierFunction) => modifierFunction(state))
  // convert number of bit's into array of angles
  .map(({bitCount, encoding}) => ({
    // number of bits
    bitCount,
    // the encoding to interpret the bit pattern
    encoding,
    // boolean if more bits can be added
    canAddBits: bitCount < maxBitCount,
    // boolean if a bit can be removed
    canRemoveBits: bitCount > 1,
  }));
};

const view = (state$, circle$) =>
  O.combineLatest(state$, circle$, render)
;

const numberCircleApp = (sources) => {
  const {
    DOM,
    globalEvents,
  } = sources;

  const actions = intent(sources.DOM);
  const state$ = model({initial: 3, max: 7}, actions);

  const circle = isolate(Circle, 'circle')({
    DOM: DOM,
    globalEvents: globalEvents,
    bitCount$: state$.map((s) => s.bitCount),
    encoding$: state$.map((s) => s.encoding),
  });

  const vtree$ = view(state$, circle.DOM);

  return {
    DOM: vtree$,
    preventDefault: circle.preventDefault,
    stopPropagation: circle.stopPropagation,
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  stopPropagation: stopPropagationDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
