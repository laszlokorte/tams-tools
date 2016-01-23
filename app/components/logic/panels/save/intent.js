export default ({DOM}) => {
  const textField = DOM.select('.export-text, .export-text-single');

  return {
    selectAll$: textField
      .events('click')
      .map((evt) => evt.ownerTarget)
      .share(),
  };
};
