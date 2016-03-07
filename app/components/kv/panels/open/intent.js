import {Observable as O} from 'rx';

import fileReader from './file-reader';

export default ({DOM, expression$}) => {
  const openExampleButton = DOM.select('[data-open-json]');
  const openExampleEvent$ = openExampleButton
    .events('click');

  const fileInput = DOM.select('[data-file-picker="json"]');

  const expressionButton = DOM.select('[data-action="import-expression"]');
  const importClick$ = expressionButton.events('click');
  const importExpression$ = expression$
    .sample(importClick$)
    .map((output) => output.result)
  ;

  const openFileEvent$ = fileInput.events('change');

  const open$ = O.merge([
    openExampleEvent$
      .map((evt) => evt.ownerTarget.dataset.openJson),

    openFileEvent$
      .flatMapLatest((evt) => {
        const file = evt.ownerTarget.files[0];

        return fileReader(file);
      }),
  ]);

  return {
    open$: open$.share(),
    importExpression$: importExpression$.share(),
    preventDefault: O.merge(
      openExampleEvent$,
      openExampleButton.events('mousedown'),
      expressionButton.events('mousedown')
    ),
  };
};
