import {expressionToString} from './formatter';
import {evaluateAll} from './evaluation';

export default (
  context,
  showSubExpressions,
  formatter
) => {
  const groups = [];

  if (context.freeIdentifiers.size) {
    groups.push({
      name: "identifiers",
      columns: context.freeIdentifiers.map(
        (i) => ({name: expressionToString(i, formatter)})
      ).toArray(),
    });
  }

  if (!context.sortedExpressions.isEmpty()) {
    groups.push({
      name: "expressions",
      columns: context.sortedExpressions.map(
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

  if (showSubExpressions && context.subExpressions.size) {
    groups.push({
      name: "Sub expressions",
      columns: context.subExpressions.map(
        (e) => ({name: expressionToString(e, formatter)})
      ).toArray(),
    });
  }
  return {
    columnGroups: groups,

    rows: context.freeIdentifiers.size < 9 ? evaluateAll({
      expressions: context.freeIdentifiers
        .concat(context.sortedExpressions)
        .concat(showSubExpressions ? context.subExpressions : []).toList(),
      identifiers: context.freeIdentifiers,
    }).map((row) => ({
      values: row.values.map(::formatter.formatVectorValue).toArray(),
    })).toArray() : [],

    error: context.freeIdentifiers.size < 9 ? null :
      "Too many variables",
  };
};
