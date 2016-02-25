import I from 'immutable';

import {
  collectIdentifiers,
  collectSubExpressions,
} from './expression';

import sortTopological from './topological-sort';

const context = I.Record({
  freeIdentifiers: I.Set(),
  declaredIdentifiers: I.Set(),
  expressions: I.List(),
  sortedExpressions: I.List(),
  toplevelExpressions: I.List(),
  subExpressions: I.List(),
}, 'context');

export const contextFromLabeledExpression = (expressions) => {
  const expressionList = I.List(expressions);
  const declaredIdentifiers = expressionList
    .filter((id) => id.name !== null);

  const deduplicatedIds = new Set();

  for (let decl of declaredIdentifiers) {
    if (deduplicatedIds.has(decl.name)) {
      let error = new Error("Duplicate declaration of " + decl.name);
      error.location = decl.location;
      throw error;
    } else {
      deduplicatedIds.add(decl.name);
    }
  }

  const freeIdentifiers = expressionList.flatMap(
    (expression) => collectIdentifiers(expression.content)
  ).toSet()
  .filter((i) => !deduplicatedIds.has(i.name))
  .toList();

  const nodeMap = {};
  const nodeList = [];
  const duplicates = new Set();

  expressionList.forEach((e) => {
    const node = {
      data: e,
      outgoing: new Set(),
      incomingCount: 0,
    };
    nodeList.push(node);

    if (e.name === null) {
      return;
    } else if (nodeMap.hasOwnProperty(e.name)) {
      duplicates.add(e.name);
    } else {
      nodeMap[e.name] = node;
    }
  });

  const nodeFromMap = (name) => nodeMap[name];
  for (let node of nodeList) {
    let dependencies = collectIdentifiers(node.data.content)
      .map((id) => id.name)
      .filter(::deduplicatedIds.has)
      .map(nodeFromMap)
      .toArray();

    for (let d of dependencies) {
      d.outgoing.add(node);
    }
  }

  try {
    const sortedExpressions = sortTopological(nodeList).map((node) =>
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
      const msg = `Cyclic dependency between: ${steps.join(', ')}`;
      const cycleError = new Error(msg);
      cycleError.location = error.cycle[error.cycle.length - 1].data.location;
      throw cycleError;
    } else {
      throw error;
    }
  }
};
