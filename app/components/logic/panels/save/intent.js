export default ({DOM}) => {
  const textField = DOM.select('.export-text');

  return {
    selectAll$: textField.events('click').map((evt) => evt.ownerTarget),
  };
};
