import {Observable as O} from 'rx';

export const helpAction = ({DOM}) => {
  const helpButton = DOM.select('.help-button');
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
