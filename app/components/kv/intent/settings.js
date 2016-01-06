import {Observable as O} from 'rx';

export const settingsAction = ({DOM}) => {
  const settingsButton = DOM.select('[data-action="settings"]');
  const event$ = settingsButton
    .events('click');

  return {
    action$: event$
      .map(() => true)
      .share(),
    preventDefault: O.merge(
      event$,
      settingsButton.events('mousedown')
    ),
  };
};
