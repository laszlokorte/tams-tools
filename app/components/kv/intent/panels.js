import {Observable as O} from 'rx';

export default ({DOM}) => {
  const actionButton = DOM.select('[data-panel]');
  const event$ = actionButton
    .events('click');

  return {
    open$: event$
      .map((evt) => evt.ownerTarget.dataset.panel)
      .share(),
    preventDefault: O.merge([
      event$,
      actionButton.events('mousedown'),
    ]).share(),
  };
};
