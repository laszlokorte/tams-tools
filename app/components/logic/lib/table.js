import I from 'immutable';
import {evaluateAll, expressionToString} from './expression';

export default (
  identifiers,
  topLevelExpressions,
  subExpressions = I.List()
) => {
  const groups = [
    {
      name: "identifiers",
      columns: identifiers.map(
        (i) => ({name: expressionToString(i)})
      ).toArray(),
    },
  ];

  if (topLevelExpressions.length) {
    groups.push({
      name: "expressions",
      columns: topLevelExpressions.map(
        (i) => ({name: expressionToString(i)})
      ).toArray(),
    });
  }

  if (subExpressions.length) {
    groups.push({
      name: "Sub expressions",
      columns: subExpressions.map(
        (i) => ({name: expressionToString(i)})
      ).toArray(),
    });
  }

  return {
    columnGroups: groups,

    rows: evaluateAll({
      expressions: identifiers
        .concat(topLevelExpressions)
        .concat(subExpressions).toList(),
      identifiers,
    }).map((row) => ({
      values: row.values.map(
        (v) => v ? '1' : '0'
      ).toArray(),
    })).toArray(),
  };
};
