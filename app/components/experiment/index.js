import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {svg} from '@cycle/dom';

import HelpBox from '../help';
import Spinner from '../spinner';
import Switch from '../switch';
import RadioPanel from '../radiopanel';
import Graphics from '../graphics';

import view from './view';
import help from './help';

export default (responses) => {
  const {
    DOM,
  } = responses;

  const helpBox = isolate(HelpBox, 'helpBox')({
    DOM,
    props$: O.just({
      visible: true,
    }),
    content$: O.just(help()),
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

  const modePanel = isolate(RadioPanel, 'modePanel')({
    DOM,
    props$: O.just({
      label: 'Modes',
      options: [
        {label: 'A', value: 'a'},
        {label: 'B', value: 'b'},
        {label: 'C', value: 'c'},
      ],
    }),
    value$: O.just('a'),
  });

  const canvas = isolate(Graphics, 'myCanvas')({
    DOM,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: O.just({min: -500, max: 500}),
    content$: O.just(svg('circle',
      {attributes: {cx: 50, cy: 50, r: 20, fill: 'magenta'}})),
  });

  const state$ = O.just(null);
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
      inputSpinner$: inputSpinner.DOM,
      modeSwitch$: modeSwitch.DOM,
      canvas$: canvas.DOM,
      modePanel$: modePanel.DOM,
    }
  );

  return {
    DOM: vtree$,
  };
};
