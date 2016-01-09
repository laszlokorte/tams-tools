export default ({DOM}) => {
  const checkboxes = DOM.select('input[name="view"]');

  const check$ = checkboxes.events('change')
    .map((evt) => evt.ownerTarget.value)
    .share()
  ;

  return {
    check$,
  };
};
