import { Editor, Location, Point, Range, Selection } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * Is a point at the end of a word
 */
export const isPointAtWordEnd = (editor: Editor, point: Point) => {
  const AFTER_MATCH_REGEX = /^(\s|$)/;

  // Point after point
  const after = Editor.after(editor, point);

  // From point to after
  const afterRange = Editor.range(editor, point, after);
  const afterText = getEditorText(editor, afterRange);

  // Match regex on after text
  return !!afterText.match(AFTER_MATCH_REGEX);
};

export const isRangeContained = (outer: Range, inner: Range) => {
  const [outer_start, outer_end] = Range.edges(outer);
  const [inner_start, inner_end] = Range.edges(inner);
  return (
    Point.compare(outer_start, inner_start) < 1 &&
    Point.compare(outer_end, inner_end) > -1
  );
};

const getEditorEnd = (e: Editor) => {
  return Editor.end(e, []);
};

const getEditorStart = (e: Editor) => {
  return Editor.start(e, []);
};

const getEditorEndToEndRange = (e: Editor): Range => {
  return { anchor: getEditorStart(e), focus: getEditorEnd(e) };
};

export const isSelectionCollapsed = (s: Selection): s is Selection => {
  return s !== null && Range.isCollapsed(s);
};

const getEditorText = (e: Editor, at?: Location | null) => {
  if (at !== null && at !== undefined) {
    return Editor.string(e, at);
  }
  return '';
};

export const isPointAtBlockStart = (e: Editor, point: Point) => {
  const [_, path] = Editor.above(e, {
    at: point,
    match: n => Editor.isBlock(e, n),
  }) ?? [undefined, undefined];
  return path !== undefined && Editor.isStart(e, point, path);
};

const escapeRegExp = (r: string) => {
  return r.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const matchesTriggerAndPattern = (
  editor: Editor,
  { at, trigger, pattern }: { at: Point; trigger: string; pattern: string }
) => {
  // Point at the start of line
  const lineStart = Editor.before(editor, at, { unit: 'line' });

  // Range from before to start
  const beforeRange = lineStart && Editor.range(editor, lineStart, at);

  // Before text
  const beforeText = getEditorText(editor, beforeRange);

  // Starts with char and ends with word characters
  const escapedTrigger = escapeRegExp(trigger);

  const beforeRegex = new RegExp(`(?:^|\\s)${escapedTrigger}(${pattern})$`);

  // Match regex on before text
  const match = !!beforeText && beforeText.match(beforeRegex);

  // Point at the start of mention
  const mentionStart = match
    ? Editor.before(editor, at, {
        unit: 'character',
        distance: match[1].length + trigger.length,
      })
    : null;

  // Range from mention to start
  const mentionRange = mentionStart && Editor.range(editor, mentionStart, at);

  return {
    range: mentionRange,
    match,
  };
};

export const getTextFromTrigger = (
  editor: Editor,
  { at, trigger }: { at: Point; trigger: string }
) => {
  const escapedTrigger = escapeRegExp(trigger);
  const triggerRegex = new RegExp(`^${escapedTrigger}`);
  const noWhiteSpaceRegex = new RegExp(`\\S+`);

  // cursor
  let start: Point | undefined = at;
  let end: Point | undefined;

  while (true) {
    // end = cursor
    end = start;

    if (!start) break;

    start = Editor.before(editor, start);
    const charRange = start && Editor.range(editor, start, end);
    const charText = getEditorText(editor, charRange);

    // Match non-whitespace character on before text
    if (!charText.match(noWhiteSpaceRegex)) {
      start = end;
      break;
    }
  }

  // Range from start to cursor
  const range = start && Editor.range(editor, start, at);
  const text = getEditorText(editor, range);

  if (!range || !text.match(triggerRegex)) return;

  return {
    range,
    textAfterTrigger: text.substring(1),
  };
};

export const setElementPositionByRange = (
  editor: Editor,
  { ref, at }: { ref: any; at: Range | null }
) => {
  if (!at) return;

  const el = ref.current;
  if (!el) return;

  const domRange = ReactEditor.toDOMRange(editor, at);
  const rect = domRange.getBoundingClientRect();
  el.style.top = `${rect.top + window.pageYOffset + 24}px`;
  el.style.left = `${rect.left + window.pageXOffset}px`;
};

// export const getMultiWordSearch = (
//   editor: Editor,
//   at: Point,
//   options: {
//     ignoreSelectionOperations?: boolean;
//     ignoreDeletionOperations?: boolean;
//   }
// ) => {
//   const {
//     ignoreDeletionOperations = true,
//     ignoreSelectionOperations = true,
//   } = options;
//   // if every operation is a selection operation then do not show completions
//   // for example we do not show completions on click or when the user navigates
//   // text with arrows
//   if (editor.operations.every(op => Operation.isSelectionOperation(op))) {
//     return [];
//   }
//   // if every operation is a remove text operation then do not show completions
//   // for example we do not show completions after back space
//   if (
//     editor.operations.every(
//       op => Operation.isTextOperation(op) && op.type === 'remove_text'
//     )
//   ) {
//     return [];
//   }
//   return getSearchesAndRanges(editor, {
//     at: at,
//     getSearchesAndSlices: ({ beforeText, editor, beforeRange }) => {
//       if (beforeRange === undefined || beforeText === '') {
//         return [];
//       }

//       let start: Point | undefined  = at;
//       let end: Point | undefined;
//       while(true) {
//         end = start
//         if (!start) {
//           break
//         }
//         start = Editor.before(editor, start, {unit: "character"})
//         const
//       }

//       return [];
//     },
//   });
// };
