import {Observable as O} from 'rx';

import editIntent from './edit';
import graphIndent from './graph';

export default (DOM, globalEvents, graphAction$) => {
  const editActions = editIntent(DOM);
  const graphActions = graphIndent(graphAction$);

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

    addState$: graphActions.addState$,
    moveState$: graphActions.moveState$,
    addTransition$: graphActions.addTransition$,
    removeState$: graphActions.removeState$,
    removeTransition$: graphActions.removeTransition$,

    preventDefault: O.merge([
      editModeButton.events('mousedown'),

      editActions.preventDefault,
    ]),
  };
};
