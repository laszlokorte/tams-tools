import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

import {parseDataAttr} from '../../../lib/utils';

const isNoInput = (evt) => {
  const tagName = evt.target.tagName;
  return tagName !== 'INPUT' &&
    tagName !== 'TEXTAREA' &&
    tagName !== 'SELECT' &&
    tagName !== 'BUTTON';
};

export default ({DOM}) => {
  const outputLabel = DOM
    .select('.state-editable[data-kv-output-label]');

  const outputEditLabel = DOM
    .select('[data-kv-output-edit-label]');

  const incrementButton = DOM
    .select('[data-kv-counter="increment"]');

  const decrementButton = DOM
    .select('[data-kv-counter="decrement"]');

  const addOutputButton = DOM
    .select('[data-kv-add-output]');

  const addOutputEvent$ = addOutputButton
    .events('click');

  const removeOutputEvent$ = DOM
    .select('[data-kv-remove-output]')
    .events('click');

  const incrementEvent$ = incrementButton
    .events('click');

  const decrementEvent$ = decrementButton
    .events('click');

  const startRenameEvent$ = outputLabel
    .events('click')
    .filter(isNoInput);

  const cancelRenameEvent$ = outputEditLabel
    .events('keydown')
    .filter((e) => e.keyCode === 27);

  const tryOutputNameEvent$ = outputEditLabel
    .events('input');

  const confirmOutputNameEvent$ = O.merge(
    outputEditLabel
      .events('keydown')
      .filter((e) => e.keyCode === 13),
    outputEditLabel
        .events('focusout')
  ).share();

  return {
    addInput$:
      incrementEvent$
        .map(() => true)
        .share(),
    removeInput$:
      decrementEvent$
        .map(() => true)
        .share(),
    cycleValue$:
      DOM
        .select('.kv-cell-atom[data-edit="function"][data-kv-cell]')
        .events('click')
        .map((evt) => ({
          reverse: evt.altKey,
          output: parseInt(evt.currentTarget.dataset.kvOutput, 10),
          cell: BitSet(evt.currentTarget.dataset.kvCell),
        }))
        .share(),
    addOutput$:
      addOutputEvent$
        .map(() => true)
        .share(),
    removeOutput$:
      removeOutputEvent$
        .map(parseDataAttr('kvRemoveOutput'))
        .filter(isFinite)
        .share(),

    startRename$:
      startRenameEvent$
        .map((evt) => parseInt(evt.currentTarget.dataset.kvOutputLabel, 10))
        .share(),

    cancelRename$:
      cancelRenameEvent$
        .map(() => true)
        .share(),

    tryOutputName$:
      tryOutputNameEvent$
        .map((evt) => ({
          outputIndex: parseInt(
            evt.currentTarget.dataset.kvOutputEditLabel,
            10),
          name: evt.currentTarget.value,
        }))
        .share(),

    confirmOutputName$:
      confirmOutputNameEvent$
        .map(() => true)
        .share(),

    preventDefault: O.merge(
      incrementEvent$,
      decrementEvent$,
      incrementButton.events('mousedown'),
      decrementButton.events('mousedown'),
      startRenameEvent$,
      cancelRenameEvent$,
      tryOutputNameEvent$,
      confirmOutputNameEvent$,
      addOutputEvent$,
      addOutputButton.events('mousedown'),
      removeOutputEvent$
    ),
  };
};
