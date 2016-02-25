import I from 'immutable';

import {
  collectIdentifiers,
  collectSubExpressions,
} from './analyze';

import {sort, Node} from './topological-sort';

const context = I.Record({
  freeIdentifiers: I.Set(),
  declaredIdentifiers: I.Set(),
  expressions: I.List(),
  sortedExpressions: I.List(),
  toplevelExpressions: I.List(),
  subExpressions: I.List(),
}, 'context');

const buildDependencyGraph = (expressionList) => {
  const declaredIdentifiers = new Set(
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
    let dependencies = collectIdentifiers(node.data.content)
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

const deduplicateDeclarations = (declaredIdentifiers) => {
  const deduplicatedIds = new Set();

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

export const contextFromLabeledExpression = (expressions) => {
  const expressionList = I.List(expressions);
  const declaredIdentifiers = expressionList
    .filter((id) => id.name !== null);

  const declaredNames = deduplicateDeclarations(declaredIdentifiers);

  const freeIdentifiers = expressionList
  .flatMap(
    (expression) => collectIdentifiers(expression.content)
  )
  .toSet()
  .filter((i) => !declaredNames.has(i.name))
  .toList();

  const nodeList = buildDependencyGraph(expressionList);

  try {
    const sortedExpressions = sort(nodeList).map((node) =>
      node.data
    );

    const subExpressions = expressionList.flatMap(
      (expression) => collectSubExpressions(expression.content)
        .toList()
    );

    const toplevelExpressions = expressionList.filter(
      (e) => e.name !== null || e.content.node !== 'identifier'
    );

    return context({
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
        error.cycle.get(error.cycle.length - 1).data.location
      );
    } else {
      throw error;
    }
  }
};
