import I from 'immutable';

import {evaluateSingle} from './evaluation';

// an object representing the unification of two identifiers
const unification = I.Record({
  identifierA: null,
  identifierB: null,
});

// a pair of expressions that should be compared
const pair = I.Record({
  expressionA: null,
  expressionB: null,
});

// the reason why two expressions are not equal
const reason = I.Record({
  valueA: null, // the value of the one expression
  valueB: null, // the value of the other epressions
  identifierMap: null, // the input values for which
                       // the expressions evaluate to
                       // the respective values
});

// the result of the comparsion of two expression
const comparison = I.Record({
  expressionA: null, // the one expression
  expressionB: null, // the other expression
  equal: false, // if they are equal
  reasons: I.List(), // the reason explaining why they are not equal
});

// the result of comparing two logic networks
const result = I.Record({
  // error message if networks could not be compared
  error: null,
  // The identifiers of both networks that have unified
  // in order to do the comparison
  unifications: I.List(),
  // the list of single expression comparisons that have been made
  comparisons: I.List(),
});

// check if the two networks have the same number of identifiers
const sameNumberOfIdentifiers = (networkA, networkB) => {
  return networkA.freeIdentifiers.count() ===
    networkB.freeIdentifiers.count();
};

// unify the identifiers that the two networks do not have in common
const unifyIdentifiers = (networkA, networkB) => {
  const idsA = I.OrderedSet(networkA.freeIdentifiers);
  const idsB = I.OrderedSet(networkB.freeIdentifiers);

  const idsOnlyA = idsA.subtract(idsB).toList();
  const idsOnlyB = idsB.subtract(idsA).toList();

  return idsOnlyA.zipWith((identifierA, identifierB) => {
    return unification({identifierA, identifierB});
  }, idsOnlyB);
};

// if the given expression has a label
const isLabeled = (expression) =>
  expression.name !== null
;

// if the given expression has no label
const isNotLabeled = (expression) =>
  !isLabeled(expression)
;

// try to find pairs of expressions to comparse
// This will pair expressions of both networks
// that have the same label.
// Unlabeled expressions will be paired by there index
//
// If expressions to not match up an {error} object will be returned
// otherwise a {pairs} object will be returned containing a list of pairs.
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

  const labelsA = I.Set(labelMapA.keys());
  const labelsB = I.Set(labelMapB.keys());

  const labelsOnlyA = labelsA.subtract(labelsB);
  const labelsOnlyB = labelsB.subtract(labelsA);

  const unlabeledA = networkA.toplevelExpressions.isEmpty() ?
    networkA.sortedExpressions :
    networkA.toplevelExpressions
      .filter(isNotLabeled);

  const unlabeledB = networkB.toplevelExpressions.isEmpty() ?
    networkB.sortedExpressions :
    networkB.toplevelExpressions
    .filter(isNotLabeled);

  const commonLabels = labelsA.intersect(labelsB);

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

// create a function that returns an identifier map containg
// values for given identifiers and their unifications
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

// create a function table containing the evaluations for all expressions
// of both networks
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

// compair the given pairs of expressions
// by looking up their values in the rows of
// the given function table
const compareResult = (rows, pairs) => {
  return pairs.map((p) => {
    const areEqual = rows.reduce((d, {
      resultMapA,
      resultMapB,
    }) => {
      if (d === true) {
        const valueA = resultMapA.get(p.expressionA);
        const valueB = resultMapB.get(p.expressionB);

        return d && valueA === valueB;
      } else {
        return false;
      }
    }, true);

    const reasons = I.List(rows).map(({
      identifierMap,
      resultMapA,
      resultMapB,
    }) => reason({
      identifierMap,
      valueA: resultMapA.get(p.expressionA),
      valueB: resultMapB.get(p.expressionB),
    }));

    return comparison({
      expressionA: p.expressionA,
      expressionB: p.expressionB,
      equal: areEqual,
      reasons,
    });
  });
};

// compare the pairs from networkA and networkB
const doComparison = (networkA, networkB, unifications, pairs) => {
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

  return result({
    unifications,
    comparisons: comparisons,
  });
};

// compare the two given logic networks
export const compareNetworks = (networkA, networkB) => {
  if (!sameNumberOfIdentifiers(networkA, networkB)) {
    return result({
      error: 'The Expressions have diffrent number of variables.',
    });
  }

  const identifierUnifications = unifyIdentifiers(networkA, networkB);
  const expresionPairs = pairUpExpressions(networkA, networkB);

  if (expresionPairs.error) {
    return result({
      error: expresionPairs.error,
    });
  }

  return doComparison(
    networkA, networkB,
    identifierUnifications, expresionPairs.pairs
  );
};
