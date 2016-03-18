import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

// initialize the graphics component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.just({
    width: 500, // The width of the SVG element
    height: 500, // The height of the SVG element
  }),
  camera$ = O.just({ // The initial camera position
    x: 0, // position on the x axis
    y: 0, // position on the y axis
    zoom: 1, // zoom factor
  }),
  bounds$ = O.just({ // The bounding box of the scene.
    // The camera can not be moved outside this box
    minX: 0,
    maxX: 0,
    minX: 0,
    maxX: 0,
  }),
  content$, // the virtual svg tree to be displayed as scene
  autoCenter$ = O.just(null), // Automatic camera alignment.
    // Whenever this stream emits an item the camera get's aligned
}) => {
  const actions = intent(DOM, globalEvents);
  const state$ = model({
    props$, camera$, bounds$, content$, autoCenter$,
  }, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
  };
};
