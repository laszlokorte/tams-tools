import {expressionToString} from './formatter';
import {evaluateAll} from './evaluation';

// Max number of identifiers for which an function tabe should be created
// For more than 9 identifiers (512 rows) the expression table can
// not efficiently created because DOM updates are not fast enough
const MAX_IDENTIFIERS = 9;

// convert a logicNetwork into a function table
// to be displayed by the table component
export default (
  logicNetwork,
  showSubExpressions,
  formatter
) => {
  const groups = [];

  // The first column group contains contains the identifiers
  if (logicNetwork.freeIdentifiers.size) {
    groups.push({
      name: "identifiers",
      columns: logicNetwork.freeIdentifiers.map(
        (i) => ({name: expressionToString(i, formatter)})
      ).toArray(),
    });
  }

  // the second columns group contains the expressions
  if (!logicNetwork.sortedExpressions.isEmpty()) {
    groups.push({
      name: "expressions",
      columns: logicNetwork.sortedExpressions.map(
        (e) => ({
          name:
            e.name ?
            (e.name + (showSubExpressions ?
              " = " + expressionToString(e.body, formatter) :
              ''
            )) :
            expressionToString(e.body, formatter),
        })
      ).toArray(),
    });
  }

  // if sub expressions are enabled
  // the third column group contains the sub expressions
  if (showSubExpressions && logicNetwork.subExpressions.size) {
    groups.push({
      name: "Sub expressions",
      columns: logicNetwork.subExpressions.map(
        (e) => ({name: expressionToString(e, formatter)})
      ).toArray(),
    });
  }
  return {
    columnGroups: groups,

    rows: logicNetwork.freeIdentifiers.size < 9 ? evaluateAll({
      expressions: logicNetwork.freeIdentifiers
        .concat(logicNetwork.sortedExpressions)
        .concat(showSubExpressions ? logicNetwork.subExpressions : []).toList(),
      identifiers: logicNetwork.freeIdentifiers,
    }).map((row) => ({
      values: row.values.map(::formatter.formatVectorValue).toArray(),
    })).toArray() : [],

    // For more than MAX_IDENTIFIERS variables the function table
    // gets to large to be rendered effeciently
    // This could be improved by improving the table component
    // rendering
    error: logicNetwork.freeIdentifiers.size < MAX_IDENTIFIERS ? null :
      "Too many variables",
  };
};
