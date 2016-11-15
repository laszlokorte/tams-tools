import {Observable as O} from 'rx';

const phantom = ', phantom, s sep = 3cm';

const latexTree = (tree) => {
  if (tree === null) {
    return "";
  } else {
    return `[${[
      tree.hidden ? phantom :
      `$${tree.formattedName}$, text centered`,
      ...tree.children.map(latexTree),
    ].join(' ')}]`;
  }
};

const wrapInLatexBlock = (t) =>
  `\\begin{forest}${t}\\end{forest}`
;

export default (table$, formula$, tree$/*, actions*/) =>
  O.combineLatest(
    table$
      .startWith(''),
    formula$
      .startWith(''),
    tree$
      .startWith(null)
      .map(latexTree)
      .map(wrapInLatexBlock),
    (table, formula, tree) => ({
      table,
      formula,
      tree,
    })
  )
  .shareReplay(1)
;
