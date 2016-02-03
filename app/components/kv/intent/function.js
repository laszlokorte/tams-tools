import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

const isNoInput = (evt) => {
  const tagName = evt.target.tagName;
  return tagName !== 'INPUT' &&
    tagName !== 'TEXTAREA' &&
    tagName !== 'SELECT' &&
    evt.target.contentEditable !== "true";
};

export default ({DOM}) => {
  const outputLabel = DOM
    .select('.state-editable[data-kv-output-label]');

  const outputEditLabel = DOM
    .select('[data-kv-output-edit-label]');

  const incrementInputsButton = DOM
    .select('[data-spinner="inputs"] [data-spinner-action="increment"]');

  const decrementInputsButton = DOM
    .select('[data-spinner="inputs"] [data-spinner-action="decrement"]');

  const incrementOutputsButton = DOM
    .select('[data-spinner="outputs"] [data-spinner-action="increment"]');

  const decrementOutputsButton = DOM
    .select('[data-spinner="outputs"] [data-spinner-action="decrement"]');

  const addOutputButton = DOM
    .select('[data-kv-add-output]');

  const addOutputEvent$ = O.merge([
    addOutputButton.events('click'),
    incrementOutputsButton.events('click'),
  ]);

  const removeOutputEvent$ = DOM
    .select('[data-kv-remove-output]')
    .events('click');

  const decrementOutputsEvent$ = decrementOutputsButton
    .events('click');

  const incrementInputsEvent$ = incrementInputsButton
    .events('click');

  const decrementInputsEvent$ = decrementInputsButton
    .events('click');

  const startRenameEvent$ = outputLabel
    .events('click')
    .filter(isNoInput);

  // IE9,10,11 do not fire input
  // events on contentEditable elements
  // So take both keyup and input events
  // But only care about the stream of which
  // we get the first event and then ignore the
  // other stream.
  // If available the input event is prefered because
  // it is fired on each value change and not only
  // keyboard input
  const tryOutputNameEvent$ = O.amb(
    outputEditLabel.events('keyup'),
    outputEditLabel.events('input')
  ).share();

  const cancelRenameEvent$ = outputEditLabel
    .events('keydown')
    .filter((e) => e.keyCode === 27);

  const confirmOutputNameEvent$ = O.merge([
    outputEditLabel
      .events('keydown')
      .filter((e) => e.keyCode === 13),
    outputEditLabel
        .events('focusout'),
  ]).share();

  return {
    addInput$:
      incrementInputsEvent$
        .map(() => true)
        .share(),
    removeInput$:
      decrementInputsEvent$
        .map(() => true)
        .share(),
    cycleValue$:
      DOM
        .select('.kv-cell-atom[data-edit="function"][data-kv-cell]')
        .events('click')
        .map((evt) => ({
          reverse: evt.altKey,
          output: parseInt(evt.ownerTarget.dataset.kvOutput, 10),
          cell: BitSet(evt.ownerTarget.dataset.kvCell),
        }))
        .share(),
    addOutput$:
      addOutputEvent$
        .map(() => true)
        .share(),
    removeOutput$:
      removeOutputEvent$
        .map((evt) => parseInt(evt.ownerTarget.dataset.kvRemoveOutput, 10))
        .filter(isFinite)
        .share(),
    removeLastOutput$:
      decrementOutputsEvent$
        .map(() => true)
        .share(),
    startRename$:
      startRenameEvent$
        .map((evt) => parseInt(evt.ownerTarget.dataset.kvOutputLabel, 10))
        .share(),

    cancelRename$:
      cancelRenameEvent$
        .map(() => true)
        .share(),

    tryOutputName$:
      tryOutputNameEvent$
        .map((evt) => {
          const textProp = ('innerText' in evt.ownerTarget) ?
            'innerText' : 'textContent';
          return {
            outputIndex: parseInt(
              evt.ownerTarget.dataset.kvOutputEditLabel,
              10),
            name: evt.ownerTarget[textProp],
          };
        })
        .share(),

    confirmOutputName$:
      confirmOutputNameEvent$
        .map(() => true)
        .share(),

    preventDefault: O.merge([
      incrementInputsEvent$,
      decrementInputsEvent$,
      incrementInputsButton.events('mousedown'),
      decrementInputsButton.events('mousedown'),
      incrementOutputsButton.events('mousedown'),
      decrementOutputsButton.events('mousedown'),
      startRenameEvent$,
      cancelRenameEvent$,
      tryOutputNameEvent$,
      confirmOutputNameEvent$,
      addOutputEvent$,
      addOutputButton.events('mousedown'),
      removeOutputEvent$,
    ]),
  };
};
