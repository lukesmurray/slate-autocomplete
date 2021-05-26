import { useCallback } from 'react';
import { Editor, Range } from 'slate';
import { IComboboxItem } from './combobox.types';
import { useSlateAutocompleteExtensionOptions } from './slateAutocompleteExtension';
import {
  getEditorText,
  getTextFromTrigger,
  isSelectionCollapsed,
} from './slateHelpers';

export interface onSearchCallback {
  (
    search: string,
    maxSuggestions: number,
    options?: {
      targetRange?: Range;
    }
  ): IComboboxItem[];
}

/**
 * Currently only supports single word search
 * @param options trigger character and max suggestions
 * @returns algorithm which can be passed to the onChange handler
 */
export const useSearchAfterTrigger = (options: {
  trigger: string;
  maxSuggestions: number;
  onSearch: onSearchCallback;
}): useSlateAutocompleteExtensionOptions['autocompleteOnChange'] => {
  const { trigger, maxSuggestions, onSearch } = options;
  return useCallback(
    (editor, options) => {
      const { closeMenu, setTargetRange, setItems } = options;
      const { selection } = editor;
      if (selection !== null && isSelectionCollapsed(selection)) {
        const cursor = Range.start(selection);
        const isCursorAfterTrigger = getTextFromTrigger(editor, {
          at: cursor,
          trigger,
        });
        if (isCursorAfterTrigger) {
          const { range, textAfterTrigger: search } = isCursorAfterTrigger;
          setTargetRange(range);
          setItems(onSearch(search, maxSuggestions));
        } else {
          closeMenu();
        }
      }
    },
    [maxSuggestions, onSearch, trigger]
  );
};

export const useSearchAfterWordBoundaries = (options: {
  boundaryRegex: string;
  maxSuggestions: number;
  onSearch: onSearchCallback;
  farthestToCloset: boolean;
  maxBoundaries: number;
}): useSlateAutocompleteExtensionOptions['autocompleteOnChange'] => {
  const {
    boundaryRegex,
    maxSuggestions,
    onSearch,
    farthestToCloset,
    maxBoundaries,
  } = options;
  return useCallback(
    (editor, options) => {
      const { closeMenu, setItems, setTargetRange } = options;
      const { selection } = editor;
      if (selection !== null && isSelectionCollapsed(selection)) {
        const cursor = Range.start(selection);
        const lineStart =
          Editor.before(editor, cursor, {
            unit: 'line',
          }) ?? cursor;
        if (lineStart === undefined) {
          closeMenu();
          return;
        }
        const beforeRange =
          lineStart && Editor.range(editor, lineStart, cursor);
        const beforeText = getEditorText(editor, beforeRange);

        let boundaries: { index: number; text: string }[] = [];
        const re = new RegExp(boundaryRegex, 'g');
        let match: RegExpExecArray | null;
        while ((match = re.exec(beforeText))) {
          boundaries.push({
            index: match.index,
            text: match[0],
          });
          if (match.index === re.lastIndex) {
            re.lastIndex++;
          }
        }

        boundaries = boundaries.slice(-maxBoundaries);
        if (farthestToCloset === false) {
          boundaries = boundaries.reverse();
        }

        let foundSuggestions: IComboboxItem[] = [];
        let targetRange: Range | undefined = undefined;
        for (let boundary of boundaries) {
          const remainingSuggestions = maxSuggestions - foundSuggestions.length;
          if (remainingSuggestions === 0) {
            break;
          }

          const lineSearchOffset = boundary.index + boundary.text.length;
          const searchStart =
            lineSearchOffset === 0
              ? lineStart
              : Editor.after(editor, lineStart, {
                  distance: lineSearchOffset,
                  unit: 'character',
                });

          const searchRange =
            searchStart && Editor.range(editor, searchStart, cursor);
          const search = getEditorText(editor, searchRange);
          if (searchRange !== undefined) {
            if (targetRange === undefined) {
              targetRange = searchRange;
            }

            foundSuggestions.push(
              ...onSearch(search, remainingSuggestions, {
                targetRange: searchRange,
              })
            );
          }
        }

        if (targetRange !== undefined && foundSuggestions.length > 0) {
          setItems(foundSuggestions);
          setTargetRange(targetRange);
        } else {
          closeMenu();
        }
      }
    },
    [boundaryRegex, farthestToCloset, maxBoundaries, maxSuggestions, onSearch]
  );
};
