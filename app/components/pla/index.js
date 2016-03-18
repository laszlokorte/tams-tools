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

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 600,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map(pluck('bounds')),
    content$: isolateSink(vtree$, 'graphicsContent'),
    autoCenter$: pla$.sample(state$).distinctUntilChanged(
      (s) => s,
      (a, b) => a.loops.length === b.loops.length &&
        a.inputs.length === b.inputs.length &&
        a.outputs.length === b.outputs.length
    ).map(() => ({weightX: 0.5, weightY: 0}))
    .sample(state$),
  });

  return {
    DOM: O.combineLatest(
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
