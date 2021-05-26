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

export interface useSlateAutocompleteExtensionOptions {
  autocompleteOnChange: (
    editor: Editor,
    options: {
      setItems: (items: IComboboxItem[]) => void;
      setTargetRange: (range: Range | null) => void;
      closeMenu: () => void;
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
}

export const useSlateAutocompleteExtension = (
  options: useSlateAutocompleteExtensionOptions
): SlateExtension & {
  getComboBoxContainerProps: () => ComboboxContainerProps;
} => {
  const { autocompleteOnChange, onSelectItem, onRenderItem } = options;

  const [items, setItems] = useState<IComboboxItem[]>([]);
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [itemIndex, setItemIndex] = useState<number>(0);

  const isOpen = targetRange !== null;

  const closeMenu = useCallback(() => {
    setTargetRange(null);
    setItems([]);
    setItemIndex(0);
  }, []);

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

  useEffect(() => {
    console.log('isOpen', isOpen);
  }, [isOpen]);

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
              targetRange: items[itemIndex].targetRange ?? targetRange,
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
      autocompleteOnChange(editor, {
        setItems,
        closeMenu,
        setTargetRange,
      });
      return next(editor);
    },
    [autocompleteOnChange, closeMenu]
  );

  return {
    getComboBoxContainerProps,
    onKeyDown: handleKeyDown,
    onKeyDownDeps: [handleKeyDown],
    onChange: handleOnChange,
    onChangeDeps: [handleOnChange],
  };
};
