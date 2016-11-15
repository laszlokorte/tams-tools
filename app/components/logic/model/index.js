import {Observable as O} from 'rx';
import I from 'immutable';

import {buildTree} from './tree';
import {buildTable} from './table';
import {buildFormula} from './formula';

import mathFormatter from '../lib/formatter/math';
import latexFormatter from '../lib/formatter/latex';
import pythonFormatter from '../lib/formatter/python';
import cBitwiseFormatter from '../lib/formatter/c-bitwise';
import cBooleanFormatter from '../lib/formatter/c-boolean';

// Time in ms to wait before the value of the text field
// is processed.
// Generating the function table and the operator tree
// takes a few milliseconds. To not disturb the user
// while typing in the text field the processing of the input is
// debounced by X milliseconds.
const DEBOUNCE_RATE = 300;

// the default output format
const DEFAULT_FORMAT = 'math';

// If sub expressions should be visible by default
const DEFAULT_SUB_EXPRESSIONS = false;

// Map of available formatters
// that can be used to format/print/stringify
// an expression
const FORMAT_MAP = {
  math: mathFormatter,
  latex: latexFormatter,
  python: pythonFormatter,
  cbitwise: cBitwiseFormatter,
  cBoolean: cBooleanFormatter,
};

// A list of available formatters and their
// respective ids.
const formatList = I.List(Object
  .keys(FORMAT_MAP)
  .map((id) => ({
    id: id,
    format: FORMAT_MAP[id],
  })))
;

// The object representing the state of the logic component
const _state = I.Record({
  // the currently selected row in the function table
  selectedRow: null,
  // the parsed result of the text field
  fieldOutput: null,
  // the id of the selected expression format
  formatId: null,
  // the list of all available formats
  formatList: I.List(),
  // If the sub expression should be visible in the function table
  showSubExpressions: false,
  // The expression as string formatted with the selected formatter
  formula: null,
  // The function table containing all values of the expression
  table: null,
  // the operator tree representing the expression
  tree: null,
});

export default (actions, expressionOutput$, selectedRow$) => {
  return O.combineLatest(
    expressionOutput$.take(1).merge(
      // debounce the processing of the user input
      // to not disturb the user while typing
      expressionOutput$.skip(1).debounce(DEBOUNCE_RATE)
    ),
    actions.selectFormat$.startWith(DEFAULT_FORMAT),
    actions.showSubExpressions$.startWith(DEFAULT_SUB_EXPRESSIONS),
    (fieldOutput, outputFormat, showSubExpressions) =>
      selectedRow$
      .startWith(_state({
        fieldOutput,
        showSubExpressions,
        formatId: outputFormat,
        formatList: formatList,
        formula: buildFormula(
          fieldOutput.network, FORMAT_MAP[outputFormat]
        ),
        table: buildTable(
          fieldOutput.network, showSubExpressions,
          FORMAT_MAP[outputFormat]
        ),
        tree: buildTree(fieldOutput.network, FORMAT_MAP[outputFormat]),
      })).scan((state, rowIndex) =>
        // update the state with the latest row index
        // and rebuild the tree in order to upate it's colors
        state
          .set('selectedRow', rowIndex)
          .set('tree', buildTree(
            state.fieldOutput.network,
            FORMAT_MAP[outputFormat],
            rowIndex)
          )
      )
  )
  .switch()
  .shareReplay(1);
};
