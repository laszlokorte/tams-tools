export default ({DOM}) => {
  const textField = DOM.select('.export-text, .export-text-single');

  const clickEvent$ = textField.events('click');

  return {
    selectAll$: clickEvent$
      .map((evt) => evt.ownerTarget)
      .share(),
  };
};
