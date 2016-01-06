import {Observable as O} from 'rx';

export const saveAction = ({DOM}) => {
  const saveButton = DOM.select('[data-action="save"]');
  const event$ = saveButton
    .events('click');

  return {
    action$: event$
      .map(() => true)
      .share(),
    preventDefault: O.merge(
      event$,
      saveButton.events('mousedown')
    ),
  };
};
