export default ({DOM}) => {
  const openExampleButton = DOM.select('[data-download]');
  const textField = DOM.select('.export-text, .export-text-single');

  const finish$ = openExampleButton.events('click').delay(1000);

  return {
    selectAll$: textField
      .events('click')
      .map((evt) => evt.ownerTarget),
    finish$,
  };
};
