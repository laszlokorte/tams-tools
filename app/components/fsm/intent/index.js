import {Observable as O} from 'rx';

import editIntent from './edit';

export default (DOM) => {
  const editActions = editIntent(DOM);

  const editModeButton = DOM.select('[data-edit-mode]');
  const editModeEvent$ = editModeButton.events('click');

  return {
    addOutput$: editActions.addOutput$,
    addInput$: editActions.addInput$,
    removeOutput$: editActions.removeOutput$,
    removeInput$: editActions.removeInput$,
    setType$: editActions.setType$,

    switchEditMode$: editModeEvent$
      .map((evt) => evt.ownerTarget.dataset.editMode)
      .share(),

    preventDefault: O.merge([
      editModeButton.events('mousedown'),

      editActions.preventDefault,
    ]),
  };
};
