import {Observable as O} from 'rx';

export default ({DOM}) => {
  const openExampleButton = DOM.select('[data-open-json]');
  const openExampleEvent$ = openExampleButton
    .events('click');

  const open$ = O.merge([
    openExampleEvent$
      .map((evt) => evt.ownerTarget.dataset.openJson),
  ]);

  return {
    open$: open$.share(),
    preventDefault: O.merge([
      openExampleEvent$,
      openExampleButton.events('mousedown'),
    ]),
  };
};
