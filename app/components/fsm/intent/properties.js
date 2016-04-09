import {Observable as O} from 'rx';

export default (DOM) => {
  const stateNameField = DOM.select('[data-state-name]');
  const transitionConditionField = DOM.select('[data-transition-condition]');

  const renameState$ = stateNameField
    .events('input')
    .map((evt) => ({
      index: parseInt(evt.ownerTarget.dataset.stateName, 10),
      name: evt.ownerTarget.value,
    }))
    .share()
    .debounce(200);

  const changeCondition$ = transitionConditionField
    .events('input')
    .map((evt) => {
      const [fromIndex, toIndex] = evt.ownerTarget.dataset
        .transitionCondition.split('-');
      return {
        fromIndex: parseInt(fromIndex, 10),
        toIndex: parseInt(toIndex, 10),
        condition: evt.ownerTarget.value,
      };
    })
    .share()
    .debounce(200);

  return {
    renameState$,
    changeCondition$,
    preventDefault: O.empty(),
  };
};
