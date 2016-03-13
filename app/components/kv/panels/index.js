import {Observable as O} from 'rx';

import isolate from '@cycle/isolate';

import HelpPanel from './help';
import SettingsPanel from './settings';
import OpenPanel from './open';
import SavePanel from './save';

export default ({DOM, keydown, open$, plaData$, jsonData$}) => {
  return {
    help: isolate(HelpPanel, 'helpPanel')({
      DOM,
      keydown,
      visible$: open$
        .map((p) => p === 'help'),
    }),

    settings: isolate(SettingsPanel, 'settingsPanel')({
      DOM,
      keydown,
      visible$: open$
        .map((p) => p === 'settings'),
      viewSetting$: O.just('function'),
    }),

    open: isolate(OpenPanel, 'openPanel')({
      DOM,
      keydown,
      visible$: open$
        .map((p) => p === 'open'),
    }),

    save: isolate(SavePanel, 'savePanel')({
      DOM,
      keydown,
      pla$: plaData$,
      json$: jsonData$,
      visible$: open$
        .map((p) => p === 'save'),
    }),
  };
};
