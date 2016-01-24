import {Observable as O} from 'rx';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {preventDefaultDriver} from '../../drivers/prevent-default';
import {keyboardDriver} from '../../drivers/keyboard';

import led from '../../components/led';

/*eslint-disable max-len*/

const drivers7Segment = {
  DOM: makeDOMDriver('#app-main'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  data$: () => O.just({
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
};

Cycle.run(led, drivers7Segment);

const driversDice = {
  DOM: makeDOMDriver('#app-assistent'),
  preventDefault: preventDefaultDriver,
  keydown: keyboardDriver,
  data$: () => O.just({
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
};

Cycle.run(led, driversDice);

