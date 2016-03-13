import {padLeft} from '../../../../lib/utils';

import {td} from '@cycle/dom';

import {
  insideLoop, isValidValueForMode,
  cellToInt,
} from '../../lib/diagram';

import renderValue from './value';

export default ({
  diagram, output, kvMode, editMode, cell,
  currentLoop, className, cellStyle,
}) => {
  const cellInt = cellToInt(cell);
  const value = diagram.outputs
    .get(output)
    .values
    .get(cellInt);

  const active = insideLoop(output, cell, currentLoop);
  const error = active && !isValidValueForMode(value, kvMode);

  const binaryIndex = padLeft(cell.toString(2), diagram.inputs.size, '0');
  const decimalIndex = cell.toString(10);

  const cellIndex = cellStyle === 'binary' ? binaryIndex : decimalIndex;
  const cellContent = cellStyle === 'function' ? renderValue(value) : cellIndex;

  return td('.kv-table-cell-body.kv-cell-atom' +
    className + ' .cell-style-' + cellStyle,
    {
      key: `kv-cell-${cellInt}`,
      className: [
        (active ? 'state-active' : null),
        (error ? 'state-error' : null),
      ].join(' '),
      attributes: {
        'data-kv-cell': binaryIndex,
        'data-kv-index': decimalIndex,
        'data-kv-value': value,
        'data-kv-output': output,
        'data-edit': editMode,
      },
    },
    cellContent
  );
};
