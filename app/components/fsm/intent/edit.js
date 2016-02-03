import {Observable as O} from 'rx';

export default (DOM) => {
  const addInputButton = DOM.select('[data-fsm-action="add-input"]');
  const addOutputButton = DOM.select('[data-fsm-action="add-output"]');

  const removeInputButton = DOM.select('[data-fsm-remove-input]');
  const removeOutputButton = DOM.select('[data-fsm-remove-output]');

  const addInputEvent$ = addInputButton.events('click');
  const addOutputEvent$ = addOutputButton.events('click');

  const removeInputEvent$ = removeInputButton.events('click');
  const removeOutputEvent$ = removeOutputButton.events('click');

  return {
    addInput$: addInputEvent$
      .map(() => true)
      .share(),
    addOutput$: addOutputEvent$
      .map(() => true)
      .share(),

    removeInput$: removeInputEvent$
      .map((evt) => parseInt(evt.ownerTarget.dataset.fsmRemoveInput, 10))
      .share(),
    removeOutput$: removeOutputEvent$
      .map((evt) => parseInt(evt.ownerTarget.dataset.fsmRemoveOutput, 10))
      .share(),

    preventDefault: O.merge([
      removeInputButton.events('mousedown'),
      removeOutputButton.events('mousedown'),
      addInputButton.events('mousedown'),
      addOutputButton.events('mousedown'),
    ]),
  };
};
