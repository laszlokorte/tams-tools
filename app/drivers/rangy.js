import {replaceSelectedText} from '../lib/rangy';

const triggerInputEvent = (element) => {
  if ("createEvent" in document) {
    const evt = document.createEvent("MutationEvents");
    evt.initEvent("input", true, true);
    element.dispatchEvent(evt);
  } else {
    element.fireEvent("oninput");
  }
};

// This driver consumes an Observable of objects
// {element, string} and insertes string into the element
export const insertStringDriver = (insertion$) => {
  insertion$.subscribe((insertion) => {
    const element = insertion.element;
    replaceSelectedText(element, insertion.string, "collapseToEnd");
    triggerInputEvent(element);
  });

  return Object.create(null);
};
