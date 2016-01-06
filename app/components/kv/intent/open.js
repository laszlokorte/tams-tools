import {Observable as O} from 'rx';

export const openAction = ({DOM}) => {
  const openButton = DOM.select('[data-action="open"]');
  const event$ = openButton
    .events('click');

  return {
    action$: event$
      .map(() => true)
      .share(),
    preventDefault: O.merge(
      event$,
      openButton.events('mousedown')
    ),
  };
};
