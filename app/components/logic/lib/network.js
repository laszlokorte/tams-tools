import I from 'immutable';

import {
  collectIdentifiers,
  collectSubExpressions,
} from './analyze';

import {sort, Node} from './topological-sort';

const logicNetwork = I.Record({
  freeIdentifiers: I.Set(),
  declaredIdentifiers: I.Set(),
  expressions: I.List(),
  sortedExpressions: I.List(),
  toplevelExpressions: I.List(),
  subExpressions: I.List(),
}, 'logicNetwork');

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
        .toList()
    );

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
