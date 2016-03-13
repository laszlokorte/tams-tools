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
  expression: null,
  formatId: null,
  formatList: I.List(),
  showSubExpressions: false,
  formula: null,
  table: null,
  tree: null,
});

export default (actions, expressionOutput$, selectedRow$) => {
  return O.combineLatest(
    expressionOutput$.take(1).concat(
      expressionOutput$.skip(1).debounce(300)
    ),
    actions.selectFormat$.startWith('math'),
    actions.showSubExpressions$.startWith(false),
    (expression, outputFormat, showSubExpressions) =>
      selectedRow$
      .startWith(_state({
        expression,
        showSubExpressions,
        formatId: outputFormat,
        formatList: formatList,
        formula: buildFormula(
          expression.result, FORMAT_MAP[outputFormat]
        ),
        table: buildTable(
          expression.result, showSubExpressions,
          FORMAT_MAP[outputFormat]
        ),
        tree: buildTree(expression.result),
      })).scan((state, row) =>
        state
          .set('selectedRow', row)
          .set('tree', buildTree(state.expression.result, row))
      )
  )
  .switch()
  .shareReplay(1);
};
