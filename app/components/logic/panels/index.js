import isolate from '@cycle/isolate';

import HelpPanel from './help';
import OpenPanel from './open';
import SavePanel from './save';

export default ({DOM, keydown, asciiTable$, formula$, open$}) => {
  return {
    help: isolate(HelpPanel, 'helpPanel')({
      DOM,
      keydown,
      visible$: open$
        .map((p) => p === 'help'),
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
      table$: asciiTable$,
      formula$,
      visible$: open$
        .map((p) => p === 'save'),
    }),
  };
};
