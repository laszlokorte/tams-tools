export const helpAction = ({DOM}) => {
  const event$ = DOM
    .select('.help-button')
    .events('click');

  return {
    action$: event$
      .map(() => true)
      .share(),
    preventDefault: event$,
  };
};
