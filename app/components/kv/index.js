import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';

import HelpBox from '../help';
import Spinner from '../spinner';
import Switch from '../switch';
import Graphics from '../graphics';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
  } = responses;

  const helpBox = isolate(HelpBox, 'helpBox')({
    DOM,
    props$: O.just({
      visible: true,
      content: 'Foobar',
    }),
  });

  const inputSpinner = isolate(Spinner, 'inputSpinner')({
    DOM,
    props$: O.just({
      value: 4,
      min: 0,
      max: 8,
    }),
  });

  const modeSwitch = isolate(Switch, 'modeSwitch')({
    DOM,
    props$: O.just({
      enabled: false,
    }),
  });

  const canvas = isolate(Graphics, 'myCanvas')({
    DOM,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: O.just({min: -500, max: 500}),
  });

  const state$ = model(O.empty(), intent(DOM));
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
      inputSpinner$: inputSpinner.DOM,
      modeSwitch$: modeSwitch.DOM,
      canvas$: canvas.DOM,
    }
  );

  return {
    DOM: vtree$,
  };
};
