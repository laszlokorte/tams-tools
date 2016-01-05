import {Observable as O} from 'rx';

export const helpAction = ({DOM}) => {
  const helpButton = DOM.select('[data-action="help"]');
  const event$ = helpButton
    .events('click');

  return {
    action$: event$
      .map(() => true)
      .share(),
    preventDefault: O.merge(
      event$,
      helpButton.events('mousedown')
    ),
  };
};
