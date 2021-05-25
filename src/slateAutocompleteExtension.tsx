import { useCombobox } from 'downshift';
import isHotkey from 'is-hotkey';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import { Editor, Range } from 'slate';
import { useSlateStatic } from 'slate-react';
import { OnChange, OnKeyDown, SlateExtension } from 'use-slate-with-extensions';
import { ComboboxItem, ComboboxRoot } from './Combobox.styles';
import { PortalBody } from './PortalBody';
import { getTextFromTrigger, isSelectionCollapsed } from './slateHelpers';

export enum ComboboxItemType {
  Normal = 0,
  Divider = 1,
  Header = 2,
}

export interface IComboboxItem {
  /**
   * Arbitrary string associated with this option.
   */
  key: string;

  /**
   * Text to render for this option
   */
  text: any;

  /**
   * Text to render for this option
   */
  itemType?: ComboboxItemType;

  /**
   * Whether the option is disabled
   * @defaultvalue false
   */
  disabled?: boolean;

  /**
   * Data available to onRenderItem.
   */
  data?: unknown;
}

const getNextNonDisabledIndex = (
  moveAmount: number,
  baseIndex: number,
  itemCount: number,
  getItemNodeFromIndex: any,
  circular: boolean
): number => {
  const currentElementNode = getItemNodeFromIndex(baseIndex);
  if (!currentElementNode || !currentElementNode.hasAttribute('disabled')) {
    return baseIndex;
  }

  if (moveAmount > 0) {
    for (let index = baseIndex + 1; index < itemCount; index++) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  } else {
    for (let index = baseIndex - 1; index >= 0; index--) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  }

  if (circular) {
    return moveAmount > 0
      ? getNextNonDisabledIndex(1, 0, itemCount, getItemNodeFromIndex, false)
      : getNextNonDisabledIndex(
          -1,
          itemCount - 1,
          itemCount,
          getItemNodeFromIndex,
          false
        );
  }

  return -1;
};

const getNextWrappingIndex = (
  moveAmount: number,
  baseIndex: number,
  itemCount: number,
  getItemNodeFromIndex: any,
  circular = true
) => {
  if (itemCount === 0) {
    return -1;
  }

  const itemsLastIndex = itemCount - 1;

  if (
    typeof baseIndex !== 'number' ||
    baseIndex < 0 ||
    baseIndex >= itemCount
  ) {
    baseIndex = moveAmount > 0 ? -1 : itemsLastIndex + 1;
  }

  let newIndex = baseIndex + moveAmount;

  if (newIndex < 0) {
    newIndex = circular ? itemsLastIndex : 0;
  } else if (newIndex > itemsLastIndex) {
    newIndex = circular ? 0 : itemsLastIndex;
  }

  const nonDisabledNewIndex = getNextNonDisabledIndex(
    moveAmount,
    newIndex,
    itemCount,
    getItemNodeFromIndex,
    circular
  );

  if (nonDisabledNewIndex === -1) {
    return baseIndex >= itemCount ? -1 : baseIndex;
  }

  return nonDisabledNewIndex;
};

const useComboboxControls = (
  isOpen: boolean,
  itemIndex: number,
  items: IComboboxItem[]
) => {
  // Menu combobox
  const {
    closeMenu,
    getMenuProps,
    getComboboxProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    isOpen,
    highlightedIndex: itemIndex,
    items,
    circularNavigation: true,
    // onInputValueChange: ({inputValue}) => {
    //   setInputItems(
    //     items.filter(item =>
    //       item.toLowerCase().startsWith(inputValue.toLowerCase()),
    //     ),
    //   )
    // },
    // onSelectedItemChange: (changes) => {
    //   console.info(changes);
    // },
  });
  getMenuProps({}, { suppressRefError: true });
  getComboboxProps({}, { suppressRefError: true });
  getInputProps({}, { suppressRefError: true });

  return useMemo(
    () => ({
      closeMenu,
      getMenuProps,
      getItemProps,
    }),
    [closeMenu, getItemProps, getMenuProps]
  );
};

interface RenderFunction<P = { [key: string]: any }> {
  (
    props: P,
    defaultRender?: (props?: P) => JSX.Element | null
  ): JSX.Element | null;
}

interface ComboboxItemProps {
  item: IComboboxItem;
}

interface useSlateAutocompleteExtensionOptions {
  trigger: string;
  autocompleteOnChange: (
    editor: Editor,
    options: {
      maxSuggestions: number;
      search: string;
      setItems: React.Dispatch<React.SetStateAction<IComboboxItem[]>>;
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
            search,
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
    [autocompleteOnChange, closeMenu, isOpen, maxSuggestions, search, trigger]
  );

  return {
    getComboBoxContainerProps,
    onKeyDown: handleKeyDown,
    onKeyDownDeps: [handleKeyDown],
    onChange: handleOnChange,
    onChangeDeps: [handleOnChange],
  };
};

interface ComboboxContainerProps {
  isOpen: boolean;
  itemIndex: number;
  items: IComboboxItem[];
  onRenderItem: useSlateAutocompleteExtensionOptions['onRenderItem'];
  onSelectItem: useSlateAutocompleteExtensionOptions['onSelectItem'];
  closeMenu: () => void;
  targetRange: Range | null;
}

export const ComboboxContainer = ({
  isOpen,
  itemIndex,
  items,
  onRenderItem,
  onSelectItem,
  closeMenu,
  targetRange,
}: ComboboxContainerProps) => {
  const combobox = useComboboxControls(isOpen, itemIndex, items);
  const menuProps = combobox ? combobox.getMenuProps() : { ref: null };

  const ref = React.useRef<any>(null);
  const multiRef = mergeRefs([menuProps.ref, ref]);
  const editor = useSlateStatic();
  if (!combobox) return null;
  return (
    <PortalBody>
      <ComboboxRoot {...menuProps} ref={multiRef} isOpen={isOpen}>
        {isOpen &&
          items.map((item, index) => {
            const Item = onRenderItem ? onRenderItem({ item }) : item.text;

            return (
              <ComboboxItem
                key={item.key}
                highlighted={index === itemIndex}
                {...combobox.getItemProps({
                  item,
                  index,
                })}
                onMouseDown={e => {
                  e.preventDefault();
                  onSelectItem(editor, {
                    item,
                    targetRange: targetRange!,
                  });
                  closeMenu();
                }}
              >
                {Item}
              </ComboboxItem>
            );
          })}
      </ComboboxRoot>
    </PortalBody>
  );
};
