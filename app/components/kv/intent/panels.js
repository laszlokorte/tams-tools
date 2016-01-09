import {Observable as O} from 'rx';

export default ({DOM}) => {
  const helpButton = DOM.select('[data-panel]');
  const event$ = helpButton
    .events('click');

  return {
    open$: event$
      .map((evt) => evt.ownerTarget.dataset.panel)
      .share(),
    preventDefault: O.merge(
      event$,
      helpButton.events('mousedown')
    ).share(),
  };
};
