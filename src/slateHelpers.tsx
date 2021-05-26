import { Editor, Location, Point, Range, Selection } from 'slate';
import { ReactEditor } from 'slate-react';

const escapeRegExp = (r: string) => {
  return r.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const getEditorText = (e: Editor, at?: Location | null) => {
  if (at !== null && at !== undefined) {
    return Editor.string(e, at);
  }
  return '';
};

export const isSelectionCollapsed = (s: Selection): s is Selection => {
  return s !== null && Range.isCollapsed(s);
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
