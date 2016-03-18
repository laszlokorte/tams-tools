/* global window */
import I from 'immutable';

import {
  collectIdentifiers,
  collectSubExpressions,
} from './analyze';

import {sort, Node} from './topological-sort';

// A logic network respresents a set of expressions
// and contains additional information about their relationship.
//
// By using labels multiple expressions can reference each other.
// eg: X = Y&Z, A = X & B
// The expression A references the expression X
// So X is not a free identifier inside expression A
const logicNetwork = I.Record({
  // A set of all identifiers occuring in the expressions
  // that are not used as labels
  freeIdentifiers: I.Set(),
  // A set of identifiers that are used to label the expressions
  declaredIdentifiers: I.Set(),
  // A list of all the expressions
  expressions: I.List(),
  // A list of all expressions toplogically sorted by their dependencies
  // The first expression in this list does not depend on the later expressions
  sortedExpressions: I.List(),
  // List of all expressions except the ones that are not labeled AND consist
  // just of an identifier.
  // Eg for following expressions:
  // X=A, A&B, Y, !Y
  // toplevelExpressions will not contain the "Y" expression
  // but all others
  toplevelExpressions: I.List(),
  // A set of all sub expressions the expressions are composed of
  subExpressions: I.Set(),
}, 'logicNetwork');

// Build a graph representing the dependencies between the given
// expressions
// returns a list of nodes representing the expressions
// and referencing the other nodes.
const buildDependencyGraph = (expressionList) => {
  const declaredIdentifiers = new window.Set(
    expressionList
      .filter((id) => id.name !== null)
      .map((id) => id.name)
      .toArray()
  );

  const {
    list: nodeList,
    map: nodeMap,
  } = expressionList.reduce(({map, list}, e) => {
    const node = new Node(e);
    const newList = list.push(node);

    if (e.name === null) {
      return {map, list: newList};
    } else {
      return {
        map: map.set(e.name, node),
        list: newList,
      };
    }
  }, {map: new I.Map(), list: new I.List()});

  for (let node of nodeList) {
    let dependencies = collectIdentifiers(node.data.body)
      .map((id) => id.name)
      .filter(::declaredIdentifiers.has)
      .map(::nodeMap.get)
      .toArray();

    for (let d of dependencies) {
      d.outgoing.add(node);
    }
  }

  return nodeList;
};

const errorAtLocation = (msg, location) => {
  const error = new Error(msg);
  error.location = location;
  return error;
};

// check a given list of identifiers for duplicates
// return Set of identifiers
// throws if there is a duplicate.
const deduplicateDeclarations = (declaredIdentifiers) => {
  const deduplicatedIds = new window.Set();

  for (let decl of declaredIdentifiers) {
    if (deduplicatedIds.has(decl.name)) {
      throw errorAtLocation(
        "Duplicate declaration of " + decl.name,
        decl.location
      );
    } else {
      deduplicatedIds.add(decl.name);
    }
  }

  return deduplicatedIds;
};

// create a logicNetwork object from a list of expressions
// throws if there are cyclic dependencies between expressions
// throws if expressions have duplcate labels
export const logicNetworkFromExpressions = (expressions) => {
  const expressionList = I.List(expressions);
  const declaredIdentifiers = expressionList
    .filter((id) => id.name !== null);

  const declaredNames = deduplicateDeclarations(declaredIdentifiers);

  const freeIdentifiers = expressionList
  .flatMap(
    (expression) => collectIdentifiers(expression.body)
  )
  .toSet()
  .filter((i) => !declaredNames.has(i.name))
  .toList();

  const nodeList = buildDependencyGraph(expressionList);

  try {
    const sortedExpressions = I.List(sort(nodeList)).map((node) =>
      node.data
    );

    const subExpressions = expressionList.flatMap(
      (expression) => collectSubExpressions(expression.body)
    ).toSet().toList();

    const toplevelExpressions = sortedExpressions.filter(
      (e) => e.name !== null || e.body._name !== 'identifier'
    );

    return logicNetwork({
      freeIdentifiers,
      declaredIdentifiers,
      expressions: expressionList,
      sortedExpressions,
      subExpressions,
      toplevelExpressions,
    });
  } catch (error) {
    if (error.cycle) {
      const steps = error.cycle.map((node) => node.data.name);
      throw errorAtLocation(
        `Cyclic dependency between: ${steps.join(', ')}`,
        error.cycle.get(error.cycle.size - 1).data.location
      );
    } else {
      throw error;
    }
  }
};
