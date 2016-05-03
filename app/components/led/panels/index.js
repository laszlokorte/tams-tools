import isolate from '@cycle/isolate';

import HelpPanel from './help';
import OpenPanel from './open';
import SavePanel from './save';

export default ({DOM, globalEvents, asciiTable$, formula$, open$}) => {
  return {
    help: isolate(HelpPanel, 'helpPanel')({
      DOM,
      globalEvents,
      visible$: open$
        .map((p) => p === 'help'),
    }),

    open: isolate(OpenPanel, 'openPanel')({
      DOM,
      globalEvents,
      visible$: open$
        .map((p) => p === 'open'),
    }),

    save: isolate(SavePanel, 'savePanel')({
      DOM,
      globalEvents,
      formula$,
      table$: asciiTable$,
      visible$: open$
        .map((p) => p === 'save'),
    }),
  };
};
