import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import {makeDOMDriver} from '@cycle/dom';
import {div, button} from '@cycle/dom';

import Circle from '../../components/number-circle';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {stopPropagationDriver} from '../../drivers/stop-propagation';
import {keyboardDriver} from '../../drivers/keyboard';
import {globalEventDriver} from '../../drivers/global-events';

import './index.styl';

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
const render = (state, circle) =>
  div('.number-circle-container', [
    div('.bit-count', ['Number of bits: ', state.bitCount]),
    renderButtons(state),
    div([
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
  };
};

const model = ({initial: initialBitCount, max: maxBitCount}, actions) => {
  const modifierFunction$ = O.merge([
    actions.addBit$.map(() => (state) =>
      ({bitCount: state.bitCount + 1})
    ),
    actions.removeBit$.map(() => (state) =>
      ({bitCount: state.bitCount - 1})
    ),
  ]);

  return modifierFunction$
  // number of bits to generate the number circle for
  .startWith({bitCount: initialBitCount})
  // apply the function
  .scan((state, modifierFunction) => modifierFunction(state))
  // convert number of bit's into array of angles
  .map(({bitCount}) => ({
    // number of bits
    bitCount,
    // boolean if more bits can be added
    canAddBits: bitCount < maxBitCount,
    // boolean fi a bit can be removed
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

  const circle = isolate(Circle)({
    DOM: DOM,
    globalEvents: globalEvents,
    bitCount$: state$.map((s) => s.bitCount),
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
  keydown: keyboardDriver,
  globalEvents: globalEventDriver,
};

Cycle.run(numberCircleApp, drivers);
