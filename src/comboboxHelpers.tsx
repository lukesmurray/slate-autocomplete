import { useCombobox } from 'downshift';
import { useMemo } from 'react';
import { IComboboxItem } from './combobox.types';

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
export const getNextWrappingIndex = (
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

export const useComboboxControls = (
  isOpen: boolean,
  itemIndex: number,
  items: IComboboxItem[]
) => {
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
