import {replaceSelectedText} from '../lib/rangy';

// This driver consumes an Observable of objects
// {element, string} and insertes string into the element
export const insertStringDriver = (insertion$) => {
  insertion$.subscribe((insertion) => {
    replaceSelectedText(insertion.element, insertion.string, "collapseToEnd");
  });

  return Object.create(null);
};
