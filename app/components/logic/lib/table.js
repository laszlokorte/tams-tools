import I from 'immutable';
import {evaluateAll, expressionToString} from './expression';

export default (
  identifiers,
  topLevelExpressions,
  subExpressions = I.List(),
  formatter
) => {
  const groups = [];

  if (identifiers.size) {
    groups.push({
      name: "identifiers",
      columns: identifiers.map(
        (i) => ({name: expressionToString(i, formatter)})
      ).toArray(),
    });
  }

  if (topLevelExpressions.size) {
    groups.push({
      name: "expressions",
      columns: topLevelExpressions.map(
        (e) => ({name: e.name || expressionToString(e.content, formatter)})
      ).toArray(),
    });
  }

  if (subExpressions.size) {
    groups.push({
      name: "Sub expressions",
      columns: subExpressions.map(
        (e) => ({name: expressionToString(e, formatter)})
      ).toArray(),
    });
  }
  return {
    columnGroups: groups,

    rows: identifiers.size < 9 ? evaluateAll({
      expressions: identifiers
        .concat(topLevelExpressions.map((e) => e.content))
        .concat(subExpressions).toList(),
      identifiers,
    }).map((row) => ({
      values: row.values.map(
        (v) => v ? '1' : '0'
      ).toArray(),
    })).toArray() : [],

    error: identifiers.size < 9 ? null :
      "Too many variables",
  };
};
