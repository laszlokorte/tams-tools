import {
  div,
  table, tr, td,
} from '@cycle/dom';

import {
  loopBelongsToOutput,
} from '../../lib/diagram';

import renderLoops from '../loops';

import tableLables from './labels';
import renderTableCell from './cell';
import renderTableHead from './head';
import renderTableFoot from './foot';
import {renderTableRowStart, renderTableRowEnd} from './row';

import './index.styl';

// generate a HTML Table from the given KV layout, kv data.
// offset is just needed for recursive calls
export const renderTable = ({
  layout,
  diagram,
  kvMode,
  editMode,
  output,
  currentLoop,
  compact = false,
  labelOffset: offset = diagram.inputs.size,
  cellStyle = 'function',
  }) => {
  const cols = layout.columns;
  const rows = layout.rows;
  const rowCount = rows.size;
  const colCount = cols.size;
  const labelOffset = offset - layout.count;

  const labels = tableLables({
    rows,
    cols,
    offset: labelOffset,
    inputs: diagram.inputs,
  });

  const styleClass = (compact ? '.style-compact' : '');
  const modeClass = '.edit-' + editMode;

  return div('.kv-container' + styleClass + modeClass, {
    key: 'kv-container',
  }, [
    (editMode === 'loops' || !compact) &&
    layout.treeHeight === 0 &&
    renderLoops(
      diagram.loops.push(currentLoop).filter(
        (loop) => loopBelongsToOutput(loop, output)
      ).toList(), kvMode, rows, cols) || null,

    table('.kv-table' + styleClass, {
      key: 'kv-table',
      className: 'kv-mode-' + kvMode.name,
      attributes: {'data-kv-height': layout.treeHeight},
    }, [
      compact ? null : renderTableHead(colCount, labels),
      layout.grid.map((row, rowIndex) =>
        tr('.kv-table-row-body', {
          key: `body-row${rowIndex}`,
        }, [
          compact ? null : renderTableRowStart(rowIndex, rowCount, labels),
          row.cells.map((cell, colIndex) => {
            if (cell.children) {
              return td('.kv-table-cell-body.kv-cell-container' + styleClass, {
                key: `kv-cell-container-${colIndex}`,
              }, [
                renderTable({
                  layout: cell.children,
                  diagram, kvMode, editMode, output,
                  currentLoop, compact,
                  labelOffset, cellStyle}),
              ]);
            } else {
              return renderTableCell({
                diagram, output, kvMode, editMode,
                cell: cell.scope,
                currentLoop,
                className: styleClass,
                cellStyle,
              });
            }
          }).toArray(),
          compact ? null : renderTableRowEnd(rowIndex, labels),
        ])
      ).toArray(),
      compact ? null : renderTableFoot(colCount, labels),
    ]),
  ]);
};
