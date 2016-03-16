import I from 'immutable';

import {evaluateSingle} from './evaluation';

const unification = I.Record({
  identifierA: null,
  identifierB: null,
});

const pair = I.Record({
  expressionA: null,
  expressionB: null,
});

const reason = I.Record({
  valueA: null,
  valueB: null,
  identifierMap: null,
});

const comparison = I.Record({
  expressionA: null,
  expressionB: null,
  equal: false,
  difference: null,
});

const diffResult = I.Record({
  error: null,
  unifications: I.List(),
  comparisons: I.List(),
});

const sameNumberOfIdentifiers = (networkA, networkB) => {
  return networkA.freeIdentifiers.count() ===
    networkB.freeIdentifiers.count();
};

const unifyIdentifiers = (networkA, networkB) => {
  const idsA = I.OrderedSet(networkA.freeIdentifiers);
  const idsB = I.OrderedSet(networkB.freeIdentifiers);

  const idsOnlyA = idsA.subtract(idsB).toList();
  const idsOnlyB = idsB.subtract(idsA).toList();

  return idsOnlyA.zipWith((identifierA, identifierB) => {
    return unification({identifierA, identifierB});
  }, idsOnlyB);
};

const isLabeled = (expression) =>
  expression.name !== null
;

const isNotLabeled = (expression) =>
  !isLabeled(expression)
;

const pairUpExpressions = (networkA, networkB) => {
  const labelMapA = I.Map(
    networkA.toplevelExpressions
    .filter(isLabeled)
    .map((e) => [e.name, e])
  );

  const labelMapB = I.Map(
    networkB.toplevelExpressions
    .filter(isLabeled)
    .map((e) => [e.name, e])
  );

  const unlabeledA = networkA.toplevelExpressions
    .filter(isNotLabeled);

  const unlabeledB = networkB.toplevelExpressions
    .filter(isNotLabeled);

  const labelsA = I.Set(labelMapA.keys());
  const labelsB = I.Set(labelMapB.keys());

  const commonLabels = labelsA.intersect(labelsB);

  const labelsOnlyA = labelsA.subtract(labelsB);
  const labelsOnlyB = labelsB.subtract(labelsA);

  const labeledPairs = commonLabels.map((label) => pair({
    expressionA: labelMapA.get(label),
    expressionB: labelMapB.get(label),
  }));

  if (!labelsOnlyA.isEmpty() || !labelsOnlyB.isEmpty()) {
    return {
      error: `Expression labels are only defined on one side: ${
        labelsOnlyA.union(labelsOnlyB).join(', ')
      }`,
    };
  } else if (unlabeledA.count() !== unlabeledB.count()) {
    return {
      error: 'Different number of expressions',
    };
  }

  const unlabeledPairs = unlabeledA.zipWith(
    (expressionA, expressionB) => pair({
      expressionA,
      expressionB,
    })
  , unlabeledB);

  return {
    pairs: labeledPairs.concat(unlabeledPairs),
  };
};

const prepareIdentifierMap = (commonIdentifiers, unifications) => (counter) => {
  const commonCount = commonIdentifiers.count();
  return I.OrderedMap(commonIdentifiers.map(
    (id, i) => [id, !!(Math.pow(2, i) & counter)]
  ).concat(unifications.flatMap(
    (u, i) => [
      [u.identifierA, !!(Math.pow(2, commonCount + i) & counter)],
      [u.identifierB, !!(Math.pow(2, commonCount + i) & counter)],
    ]
  )));
};

const evaluateBoth = ({
  identityMapBuilder,
  commonIdentifiers,
  unifications,
  networkA,
  networkB,
}) => {
  let rowCount = Math.pow(2, commonIdentifiers.size + unifications.size) - 1;
  const rows = [];

  while (rowCount >= 0) {
    const identifierMap = identityMapBuilder(rowCount).asMutable();
    const resultMapA = evaluateSingle({
      expressions: networkA.sortedExpressions,
      identifierMap,
    }).asImmutable();

    const resultMapB = evaluateSingle({
      expressions: networkB.sortedExpressions,
      identifierMap,
    }).asImmutable();

    rows.push({
      identifierMap,
      resultMapA,
      resultMapB,
    });

    rowCount--;
  }

  return rows;
};

const compareResult = (rows, pairs) => {
  return pairs.map((p) => {
    const difference = rows.reduce((d, {
      identifierMap,
      resultMapA,
      resultMapB,
    }) => {
      if (d === null) {
        const valueA = resultMapA.get(p.expressionA);
        const valueB = resultMapB.get(p.expressionB);

        if (valueA === valueB) {
          return null;
        } else {
          return reason({
            valueA, valueB, identifierMap,
          });
        }
      } else {
        return d;
      }
    }, null);

    return comparison({
      expressionA: p.expressionA,
      expressionB: p.expressionB,
      equal: difference === null,
      difference,
    });
  });
};

const diffEvaluate = (networkA, networkB, unifications, pairs) => {
  const commonIdentifiers = I.OrderedSet(networkA.freeIdentifiers)
    .intersect(networkB.freeIdentifiers).toList();

  const identityMapBuilder = prepareIdentifierMap(
    commonIdentifiers, unifications
  );

  const rows = evaluateBoth({
    networkA, networkB,
    identityMapBuilder,
    commonIdentifiers,
    unifications,
  });

  const comparisons = compareResult(rows, pairs);

  return diffResult({
    unifications,
    comparisons: comparisons,
  });
};

export const diffNetworks = (networkA, networkB) => {
  if (!sameNumberOfIdentifiers(networkA, networkB)) {
    return diffResult({
      error: 'The Expressions have diffrent number of variables.',
    });
  }

  const identifierUnifications = unifyIdentifiers(networkA, networkB);
  const expresionPairs = pairUpExpressions(networkA, networkB);

  if (expresionPairs.error) {
    return diffResult({
      error: expresionPairs.error,
    });
  }

  return diffEvaluate(
    networkA, networkB,
    identifierUnifications, expresionPairs.pairs
  );
};
