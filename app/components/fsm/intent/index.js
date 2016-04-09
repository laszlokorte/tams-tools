import {Observable as O} from 'rx';

import editIntent from './edit';
import graphIndent from './graph';
import panelIntent from './panels';
import propertiesIntent from './properties';

export default (DOM, globalEvents, graphAction$) => {
  const editActions = editIntent(DOM);
  const graphActions = graphIndent(graphAction$);
  const panelsActions = panelIntent({DOM});
  const propertiesActions = propertiesIntent(DOM);

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

    panel$: panelsActions.open$,

    renameState$: propertiesActions.renameState$,
    changeCondition$: propertiesActions.changeCondition$,
    closeProperties$: propertiesActions.closeProperties$,

    preventDefault: O.merge([
      editModeButton.events('mousedown'),

      panelsActions.preventDefault,
      editActions.preventDefault,
      propertiesActions.preventDefault,
    ]).share(),
  };
};
