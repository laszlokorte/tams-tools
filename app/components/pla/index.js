import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../lib/dom-helper';

import {pluck} from '../../lib/utils';
import graphics from '../graphics';

import {plaFromJson} from './lib/pla';
import model from './model';
import view from './view';
import costPanel from './view/cost-panel';
import intent from './intent';

const dimenstionsHaveNotChanged = (a, b) =>
  a.loops.size === b.loops.size &&
  a.inputs.size === b.inputs.size &&
  a.outputs.size === b.outputs.size
;

// initialize the pla component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.just({}), // currently no properties
  data$ = O.just({
    mode: 'dnf', // pla mode: dnf or knf
    inputs: [ // names of the inputs
      "Input A",
      "Input B",
    ],
    outputs: [ // names of the outputs
      "Out 1",
    ],
    loops: [ // list of loops.
    // each loop is a mapping from input values to output values
      {
        in: [ // input values.
          // Either true, false or null.
          // Must be same length as number of inputs.
          // null indicates dont-care
          false, true,
        ],
        out: [ // output values.
          // Either true or false.
          // must be same length as number of inputs
          true,
        ],
        color: 'blue', // color of the gate representing this loop
        highlight: false, // if the gate should be highlighted
      },
    ],
  }),
}) => {
  const pla$ = data$.map(plaFromJson).shareReplay(1);
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(props$, pla$, actions);
  const vtree$ = view(state$);

  // Use the graphics component as container for the
  // generated SVG to allow zooming and panning the content
  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({ // Dimensions of the SVG element
      width: 600,    // get overridden by CSS anyway
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map(pluck('bounds')),
    content$: isolateSink(vtree$, 'graphicsContent'),
    autoCenter$: pla$
      // align the camera as soon the the dimensions
      // of the circuit change
      .combineLatest(state$, (p) => p)
      .distinctUntilChanged(
        (s) => s,
        dimenstionsHaveNotChanged
      )
      // Center the camera vertically and align it to the top
      .map(() => ({weightX: 0.5, weightY: 0})),
  });

  return {
    DOM: O.combineLatest(
      // merge the cost panel into the vtree
      pla$.map(costPanel),
      stage.DOM,
      (a,b) => [a,b]
    ).map(wrapInDiv),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
  };
};
