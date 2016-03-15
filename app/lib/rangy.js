// FROM: https://github.com/timdown/rangyinputs
//
// Functions to manipulate the carret of text fields
// in a cross browser compatible way

const UNDEF = "undefined";
let getSelection;
let setSelection;

function isHostMethod(object, property) {
  const t = typeof object[property];
  return t === "function" ||
  (!!(t === "object" && object[property])) ||
  t === "unknown";
}

function isHostProperty(object, property) {
  return typeof (object[property]) !== UNDEF;
}

function isHostObject(object, property) {
  return !!(typeof (object[property]) === "object" && object[property]);
}

function fail(reason) {
  if (window.console && window.console.log) {
    window.console.log(
      "RangyInputs not supported in your browser. Reason: " + reason
    );
  }
}

function adjustOffsets(el, start, end) {
  let _start = start;
  let _end = end;
  if (start < 0) {
    _start += el.value.length;
  }
  if (typeof end === UNDEF) {
    _end = start;
  }
  if (end < 0) {
    _end += el.value.length;
  }
  return {
    start: _start,
    end: _end,
  };
}

function makeSelection(el, start, end) {
  return {
    start: start,
    end: end,
    length: end - start,
    text: el.value.slice(start, end),
  };
}

const getBody = () => {
  return isHostObject(document, "body") ?
    document.body :
    document.getElementsByTagName("body")[0];
};

const testTextArea = document.createElement("textarea");

getBody().appendChild(testTextArea);

if (
  isHostProperty(testTextArea, "selectionStart") &&
  isHostProperty(testTextArea, "selectionEnd")
) {
  getSelection = (el) => {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    return makeSelection(el, start, end);
  };

  setSelection = (el, startOffset, endOffset) => {
    const offsets = adjustOffsets(el, startOffset, endOffset);
    el.selectionStart = offsets.start;
    el.selectionEnd = offsets.end;
  };
} else if (
  isHostMethod(testTextArea, "createTextRange") &&
  isHostObject(document, "selection") &&
  isHostMethod(document.selection, "createRange")
) {
  getSelection = (el) => {
    let start = 0;
    let end = 0;
    let normalizedValue;
    let textInputRange;
    let len;
    let endRange;
    const range = document.selection.createRange();

    if (range && range.parentElement() === el) {
      len = el.value.length;

      normalizedValue = el.value.replace(/\r\n/g, "\n");
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());
      endRange = el.createTextRange();
      endRange.collapse(false);
      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart("character", -len);
        start += normalizedValue.slice(0, start).split("\n").length - 1;
        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd("character", -len);
          end += normalizedValue.slice(0, end).split("\n").length - 1;
        }
      }
    }

    return makeSelection(el, start, end);
  };

  // Moving across a line break only counts as
  // moving one character in a TextRange, whereas a line break in
  // the textarea value is two characters.
  // This function corrects for that by converting
  // a text offset into a
  // range character offset by subtracting one
  // character for every line break in the textarea prior to the
  // offset
  const offsetToRangeCharacterMove = (el, offset) => {
    return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
  };

  setSelection = (el, startOffset, endOffset) => {
    const offsets = adjustOffsets(el, startOffset, endOffset);
    const range = el.createTextRange();
    const startCharMove = offsetToRangeCharacterMove(el, offsets.start);
    range.collapse(true);
    if (offsets.start === offsets.end) {
      range.move("character", startCharMove);
    } else {
      range.moveEnd("character", offsetToRangeCharacterMove(el, offsets.end));
      range.moveStart("character", startCharMove);
    }
    range.select();
  };
} else {
  getBody().removeChild(testTextArea);
  fail("No means of finding text input caret position");
}

// Clean up
getBody().removeChild(testTextArea);

const getValueAfterPaste = (el, text) => {
  const val = el.value;
  const sel = getSelection(el);
  const selStart = sel.start;
  return {
    value: val.slice(0, selStart) + text + val.slice(sel.end),
    index: selStart,
    replaced: sel.text,
  };
};

function pasteTextWithCommand(el, text) {
  el.focus();
  const sel = getSelection(el);

  // Hack to work around incorrect delete command
  // when deleting the last word on a line
  setSelection(el, sel.start, sel.end);
  if (text === "") {
    document.execCommand("delete", false, null);
  } else {
    document.execCommand("insertText", false, text);
  }

  return {
    replaced: sel.text,
    index: sel.start,
  };
}

const updateSelectionAfterInsert = (
  el, startIndex, text, selectionBehaviourP
) => {
  let endIndex = startIndex + text.length;

  const selectionBehaviour = (typeof selectionBehaviourP === "string") ?
    selectionBehaviourP.toLowerCase() : "";

  if ((
    selectionBehaviour === "collapsetoend" ||
    selectionBehaviour === "select"
    ) && /[\r\n]/.test(text)
  ) {
    // Find the length of the actual text inserted, which could consty
    // depending on how the browser deals with line breaks
    const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    endIndex = startIndex + normalizedText.length;
    const firstLineBreakIndex = startIndex + normalizedText.indexOf("\n");

    if (el.value.slice(
      firstLineBreakIndex,
      firstLineBreakIndex + 2
    ) === "\r\n") {
      // Browser uses \r\n, so we need to account for extra \r characters
      endIndex += normalizedText.match(/\n/g).length;
    }
  }

  switch (selectionBehaviour) {
  case "collapsetostart":
    setSelection(el, startIndex, startIndex);
    break;
  case "collapsetoend":
    setSelection(el, endIndex, endIndex);
    break;
  case "select":
    setSelection(el, startIndex, endIndex);
    break;
  default: return;
  }
};

const pasteTextWithValueChange = (el, text) => {
  el.focus();
  const valueAfterPaste = getValueAfterPaste(el, text);
  el.value = valueAfterPaste.value;
  return valueAfterPaste;
};

let pasteText = (el, text) => {
  const valueAfterPaste = getValueAfterPaste(el, text);
  try {
    let pasteInfo = pasteTextWithCommand(el, text);
    if (el.value === valueAfterPaste.value) {
      pasteText = pasteTextWithCommand;
      return pasteInfo;
    }
  } catch (ex) {
     // Do nothing and fall back to changing the value manually
  }
  pasteText = pasteTextWithValueChange;
  el.value = valueAfterPaste.value;
  return valueAfterPaste;
};

export const replaceSelectedText = (el, text, selectionBehaviour) => {
  const pasteInfo = pasteText(el, text);
  updateSelectionAfterInsert(el,
    pasteInfo.index, text,
    selectionBehaviour || "collapseToEnd"
  );
};
