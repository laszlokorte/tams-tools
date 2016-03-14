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

const FORMAT_MAP = {
  math: mathFormatter,
  latex: latexFormatter,
  python: pythonFormatter,
  cbitwise: cBitwiseFormatter,
  cBoolean: cBooleanFormatter,
};

const formatList = I.List(Object
  .keys(FORMAT_MAP)
  .map((id) => ({
    id: id,
    format: FORMAT_MAP[id],
  })))
;

const _state = I.Record({
  selectedRow: null,
  fieldOutput: null,
  formatId: null,
  formatList: I.List(),
  showSubExpressions: false,
  formula: null,
  table: null,
  tree: null,
});

export default (actions, expressionOutput$, selectedRow$) => {
  return O.combineLatest(
    expressionOutput$.take(1).merge(
      expressionOutput$.skip(1).debounce(300)
    ),
    actions.selectFormat$.startWith('math'),
    actions.showSubExpressions$.startWith(false),
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
        tree: buildTree(fieldOutput.network),
      })).scan((state, row) =>
        state
          .set('selectedRow', row)
          .set('tree', buildTree(state.fieldOutput.network, row))
      )
  )
  .switch()
  .shareReplay(1);
};
