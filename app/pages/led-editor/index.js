import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import isolate from '@cycle/isolate';
import {makeHammerDriver} from '@cyclic/cycle-hammer-driver';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';

import LedComponent from '../../components/led';
import splitPane from '../../components/splitpane';

const fsmEditor = (sources) => {
  const {
    DOM,
    preventDefault,
    keydown,
  } = sources;

  /*eslint-disable max-len*/

  const leftComponent = isolate(LedComponent)({
    DOM,
    preventDefault,
    keydown,
    data$: O.just({
      switches: ['1', '2', '4', '8'],
      leds: [
        {
          shape: `M17.75,12.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z`,
          values: [
            true, false, true, true,
            false, true, true, true,
            true, true, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M117.5,17.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z`,
          values: [
            true, true, true, true,
            true, false, false, true,
            true, true, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M117.5,122.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z`,
          values: [
            true, true, false, true,
            true, true, true, true,
            true, true, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M17.75,222.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z`,
          values: [
            true, false, true, true,
            false, true, true, false,
            true, true, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M12.5,122.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z`,
          values: [
            true, false, true, false,
            false, false, true, false,
            true, false, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M12.5,17.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z`,
          values: [
            true, false, false, false,
            true, true, true, false,
            true, true, null, null,
            null, null, null, null,
          ],
        },
        {
          shape: `M17.75,117.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z`,
          values: [
            false, false, true, true,
            true, true, true, false,
            true, true, null, null,
            null, null, null, null,
          ],
        },
      ],
    }),
  });
  const rightComponent = isolate(LedComponent)({
    DOM,
    preventDefault,
    keydown,
    data$: O.just({
      switches: ['1', '2', '4'],
      leds: [
        {
          shape: "M39.75,26.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, true, true,
            true, true, true, null,
          ],
        },
        {
          shape: "M39.75,146.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, false, false,
            true, true, true, null,
          ],
        },
        {
          shape: "M99.75,26.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, false, false,
            false, false, true, null,
          ],
        },
        {
          shape: "M99.75,146.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, false, false,
            false, false, true, null,
          ],
        },
        {
          shape: "M99.75,86.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, true, false, true,
            false, true, false, null,
          ],
        },
        {
          shape: "M159.75,26.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, false, false,
            true, true, true, null,
          ],
        },
        {
          shape: "M159.75,146.75l7.641,2.483l4.723,6.5l0,8.034l-4.723,6.5l-7.641,2.483l-7.641,-2.483l-4.723,-6.5l0,-8.034l4.723,-6.5l7.641,-2.483Z",
          values: [
            false, false, true, true,
            true, true, true, null,
          ],
        },
      ],
    }),
  });

  const leftDOM = leftComponent.DOM;
  const rightDOM = rightComponent.DOM;

  const splitComponent = isolate(splitPane)({
    DOM,
    preventDefault,
    keydown,
    props$: O.just({proportion: 0.50}),
    firstChild$: leftDOM,
    secondChild$: rightDOM,
  });

  return {
    DOM: splitComponent.DOM,
    preventDefault: O.merge(
      splitComponent.preventDefault
    ),
    selectAll: O.empty(),
    autoResize: O.empty(),
  };
};

const drivers = {
  DOM: makeHammerDriver(makeDOMDriver('#app')),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
};

Cycle.run(fsmEditor, drivers);

