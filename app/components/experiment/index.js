import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';

import ModalBox from '../modal';
import Spinner from '../spinner';
import Switch from '../switch';
import RadioPanel from '../radiopanel';
import PLA from '../pla';
import {example as plaExample} from '../pla/pla-format';

import view from './view';
import help from './help';

export default (responses) => {
  const {
    DOM,
  } = responses;

  const helpBox = isolate(ModalBox, 'helpBox')({
    DOM,
    props$: O.just({
      visible: true,
    }),
    content$: O.just(help()),
  });

  const inputSpinner = isolate(Spinner, 'inputSpinner')({
    DOM,
    props$: O.just({
      min: 0,
      max: 15,
      label: 'Inputs',
    }),
    value$: O.just(1),
  });

  const outputSpinner = isolate(Spinner, 'outputSpinner')({
    DOM,
    props$: O.just({
      min: 1,
      max: 8,
      label: 'Outputs',
    }),
    value$: O.just(1),
  });

  const modeSwitch = isolate(Switch, 'modeSwitch')({
    DOM,
    props$: O.just({
      onLabel: 'Yes',
      offLabel: 'No',
    }),
    enabled$: O.just(true),
  });

  const modePanel = isolate(RadioPanel, 'modePanel')({
    DOM,
    props$: O.just({
      label: 'Modes',
      options: [
        {label: 'Edit', value: 'edit'},
        {label: 'KNF', value: 'knf'},
        {label: 'DNF', value: 'dnf'},
      ],
    }),
    value$: O.just('edit'),
  });

  const canvas = isolate(PLA, 'myPLA')({
    DOM,
    props$: O.just({}),
    data$: O.just(plaExample),
  });

  const state$ = O.just(null);
  const vtree$ = view(
    state$, {
      helpBox$: helpBox.DOM,
      inputSpinner$: inputSpinner.DOM,
      outputSpinner$: outputSpinner.DOM,
      modeSwitch$: modeSwitch.DOM,
      canvas$: canvas.DOM,
      modePanel$: modePanel.DOM,
    }
  );

  return {
    DOM: vtree$,
  };
};
