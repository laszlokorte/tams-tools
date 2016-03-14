import {expressionToString} from './formatter';
import {evaluateAll} from './evaluation';

export default (
  logicNetwork,
  showSubExpressions,
  formatter
) => {
  const groups = [];

  if (logicNetwork.freeIdentifiers.size) {
    groups.push({
      name: "identifiers",
      columns: logicNetwork.freeIdentifiers.map(
        (i) => ({name: expressionToString(i, formatter)})
      ).toArray(),
    });
  }

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

    error: logicNetwork.freeIdentifiers.size < 9 ? null :
      "Too many variables",
  };
};
