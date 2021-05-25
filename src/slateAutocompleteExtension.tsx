import isHotkey from 'is-hotkey';
import { useCallback, useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { OnChange, OnKeyDown, SlateExtension } from 'use-slate-with-extensions';
import {
  ComboboxItemProps,
  IComboboxItem,
  RenderFunction,
} from './combobox.types';
import { ComboboxContainerProps } from './ComboboxContainer';
import { getNextWrappingIndex } from './comboboxHelpers';
import { getTextFromTrigger, isSelectionCollapsed } from './slateHelpers';

export interface useSlateAutocompleteExtensionOptions {
  trigger: string;
  autocompleteOnChange: (
    editor: Editor,
    options: {
      maxSuggestions: number;
      search: string;
      setItems: (items: IComboboxItem[]) => void;
    }
  ) => void;
  onSelectItem: (
    editor: Editor,
    options: {
      item: IComboboxItem;
      targetRange: Range;
    }
  ) => void;
  onRenderItem?: RenderFunction<ComboboxItemProps>;
  maxSuggestions?: number;
}

export const useSlateAutocompleteExtension = (
  options: useSlateAutocompleteExtensionOptions
): SlateExtension & {
  getComboBoxContainerProps: () => ComboboxContainerProps;
} => {
  const {
    trigger,
    autocompleteOnChange,
    onSelectItem,
    onRenderItem,
    maxSuggestions: initialMaxSuggestions = 10,
  } = options;

  const [maxSuggestions, setMaxSuggestions] = useState(initialMaxSuggestions);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<IComboboxItem[]>([]);
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [itemIndex, setItemIndex] = useState<number>(0);

  useEffect(() => {
    setMaxSuggestions(initialMaxSuggestions);
  }, [initialMaxSuggestions]);

  const closeMenu = useCallback(() => {
    setTargetRange(null);
    setItems([]);
    setSearch('');
    setItemIndex(0);
  }, []);

  const isOpen = targetRange !== null;

  const getComboBoxContainerProps = useCallback((): ComboboxContainerProps => {
    return {
      isOpen,
      itemIndex,
      items,
      onRenderItem,
      onSelectItem,
      closeMenu,
      targetRange,
    };
  }, [
    closeMenu,
    isOpen,
    itemIndex,
    items,
    onRenderItem,
    onSelectItem,
    targetRange,
  ]);

  const handleKeyDown = useCallback<OnKeyDown>(
    (e, editor, next) => {
      let handled = false;
      if (isOpen) {
        if (isHotkey('down', e as any)) {
          e.preventDefault();
          const newIndex = getNextWrappingIndex(
            1,
            itemIndex,
            items.length,
            () => {},
            true
          );
          setItemIndex(newIndex);
          handled = true;
        } else if (isHotkey('up', e as any)) {
          e.preventDefault();
          const newIndex = getNextWrappingIndex(
            -1,
            itemIndex,
            items.length,
            () => {},
            true
          );
          setItemIndex(newIndex);
          handled = true;
        } else if (isHotkey(['tab', 'enter'], e as any)) {
          e.preventDefault();
          if (items[itemIndex] && targetRange) {
            onSelectItem(editor, {
              item: items[itemIndex],
              targetRange,
            });
          }
          closeMenu();
          handled = true;
        }
      }

      if (!handled) {
        return next?.(e, editor);
      }
    },
    [closeMenu, isOpen, itemIndex, items, onSelectItem, targetRange]
  );

  const handleOnChange = useCallback<OnChange>(
    (editor, next) => {
      const { selection } = editor;
      if (selection !== null && isSelectionCollapsed(selection)) {
        const cursor = Range.start(selection);
        const isCursorAfterTrigger = getTextFromTrigger(editor, {
          at: cursor,
          trigger,
        });

        if (isCursorAfterTrigger) {
          const { range, textAfterTrigger } = isCursorAfterTrigger;

          setTargetRange(range);
          setSearch(textAfterTrigger);

          autocompleteOnChange(editor, {
            maxSuggestions,
            search: textAfterTrigger,
            setItems,
          });
        } else {
          if (isOpen) {
            closeMenu();
          }
        }
      }

      return next(editor);
    },
    [autocompleteOnChange, closeMenu, isOpen, maxSuggestions, trigger]
  );

  return {
    getComboBoxContainerProps,
    onKeyDown: handleKeyDown,
    onKeyDownDeps: [handleKeyDown],
    onChange: handleOnChange,
    onChangeDeps: [handleOnChange],
  };
};
