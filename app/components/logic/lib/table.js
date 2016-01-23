import {evaluateAll} from './expression';

export default (
  identifiers,
  topLevelExpressions,
  subExpressions
) => {
  return {
    columnGroups: [
      {
        columns: identifiers.map((i) => ({name: i.name})).toArray(),
      },
      {
        columns: topLevelExpressions.map((i) => ({name: i.name})).toArray(),
      },
      {
        columns: subExpressions.map((i) => ({name: i.name})).toArray(),
      },
    ],

    rows: evaluateAll({
      expressions: identifiers
        .concat(topLevelExpressions)
        .concat(subExpressions).toList(),
      identifiers,
    }).map((row) => ({values: row.values.toArray()})).toArray(),
  };
};
