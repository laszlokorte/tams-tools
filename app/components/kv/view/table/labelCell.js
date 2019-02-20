import {
  button, span, br,
} from '@cycle/dom';

import deleteIcon from '../../../../icons/delete';
import editIcon from '../../../../icons/edit';

export const labelCell = ({index, name}, inputsEditable) =>
  inputsEditable ? [
    button('.input-button-delete', {
      attributes: {
        'data-kv-remove-input': index,
      },
      disabled: false,
    }, deleteIcon(24)),
    button('.input-button-rename', {
      attributes: {
        'data-kv-rename-input': index,
      },
      disabled: false,
    }, editIcon(24)),
    span(`${name}`),
  ] : [
    span(`${name}`),
  ];
