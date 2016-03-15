import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

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
  const pla$ = data$.map(plaFromJson).share();
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
    autoCenter$: data$.distinctUntilChanged(
      (s) => s,
      (a, b) => a.loops.length === b.loops.length &&
        a.inputs.length === b.inputs.length &&
        a.outputs.length === b.outputs.length
    ).map(() => true),
  });

  return {
    DOM: O.combineLatest(
      pla$.map(costPanel),
      stage.DOM,
      (plaEl, stageEl) => div([
        plaEl,
        stageEl,
      ])
    ),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
  };
};
