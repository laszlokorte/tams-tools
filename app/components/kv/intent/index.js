import {Observable as O} from 'rx';

import panelActions from './panels';
import loopActions from './loops';
import functionActions from './function';

const isNoInput = (evt) => {
  const tagName = evt.target.tagName;
  return tagName !== 'INPUT' &&
    tagName !== 'TEXTAREA' &&
    tagName !== 'SELECT' &&
    evt.target.contentEditable !== "true";
};

export default ({
  DOM, globalEvents, openData$,
  importExpression$, viewSetting$,
}) => {
  const cancel$ = globalEvents.events('keydown')
    .filter((evt) => evt.keyCode === 27)
    .share();

  const loops = loopActions({DOM, globalEvents, cancel$});
  const functions = functionActions({DOM});
  const panels = panelActions({DOM});

  const outputItem = DOM
    .select('[data-kv-output]');

  const selectOutputEvent$ = outputItem
    .events('click')
    .filter(isNoInput);

  const editModeButton = DOM
    .select('[data-edit-mode]');

  const kvModeButton = DOM
    .select('[data-kv-mode]');

  const switchKvModeEvent$ = kvModeButton
    .events('click');

  const switchEditModeEvent$ = editModeButton
    .events('click');

  return {
    selectOutput$:
      selectOutputEvent$
        .map((evt) => parseInt(evt.ownerTarget.dataset.kvOutput, 10))
        .filter(isFinite)
        .share(),
    switchKvMode$:
      switchKvModeEvent$
        .map((evt) => evt.ownerTarget.dataset.kvMode)
        .share(),
    switchEditMode$:
      switchEditModeEvent$
        .map((evt) => evt.ownerTarget.dataset.editMode)
        .share(),
    openDiagram$: openData$,
    importExpression$,
    setViewSetting$: viewSetting$,

    panel$: panels.open$,

    removeLoop$: loops.removeLoop$,
    tryLoop$: loops.tryLoop$,
    stopTryLoop$: loops.stopTryLoop$,
    addLoop$: loops.addLoop$,

    addInput$: functions.addInput$,
    removeInput$: functions.removeInput$,
    cycleValue$: functions.cycleValue$,
    addOutput$: functions.addOutput$,
    removeOutput$: functions.removeOutput$,
    removeLastOutput$: functions.removeLastOutput$,
    startRename$: functions.startRename$,
    cancelRename$: O.merge([
      functions.cancelRename$,
      panels.open$,
    ]).share(),
    tryOutputName$: functions.tryOutputName$,
    confirmOutputName$: functions.confirmOutputName$,

    preventDefault: O.merge([
      panels.preventDefault,
      functions.preventDefault,
      loops.preventDefault,

      selectOutputEvent$,
      outputItem.events('mousedown').filter(isNoInput),
      switchKvModeEvent$,
      kvModeButton.events('mousedown'),
      switchEditModeEvent$,
      editModeButton.events('mousedown'),
    ]).share(),
  };
};
