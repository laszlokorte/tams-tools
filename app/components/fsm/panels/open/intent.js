import {Observable as O} from 'rx';

import fileReader from './file-reader';

export default ({DOM}) => {
  const openExampleButton = DOM.select('[data-open-json]');
  const openExampleEvent$ = openExampleButton
    .events('click');

  const fileInput = DOM.select('[data-file-picker="json"]');

  const openFileEvent$ = fileInput.events('change');

  const open$ = O.merge([
    openExampleEvent$
      .map((evt) => evt.ownerTarget.dataset.openJson),

    openFileEvent$
      .map((evt) => {
        const file = evt.ownerTarget.files[0];

        return fileReader(file);
      }).switch(),
  ]);

  return {
    open$: open$.share(),
    preventDefault: O.merge([
      openExampleEvent$,
      openExampleButton.events('mousedown'),
    ]),
  };
};
