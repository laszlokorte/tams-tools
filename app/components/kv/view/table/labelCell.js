import {
  button,
} from '@cycle/dom';

import deleteIcon from '../../../../icons/delete';
import editIcon from '../../../../icons/edit';

export const labelCell = ({index, name}, inputsEditable) =>
  inputsEditable ? [
    button('.input-button-delete', {
      attributes: {
        'data-kv-remove-input': index,
      },
      title: 'Remove input ' + name,
      disabled: false,
    }, deleteIcon(24)),
    button('.input-button-rename', {
      attributes: {
        'data-kv-rename-input': index,
      },
      disabled: false,
      title: 'Rename input ' + name,
    }, editIcon(24)),
  ] : [
  ];
