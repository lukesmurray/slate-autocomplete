import React, { useEffect } from 'react';
import mergeRefs from 'react-merge-refs';
import { Range } from 'slate';
import { useSlateStatic } from 'slate-react';
import { ComboboxItem, ComboboxRoot } from './combobox.styles';
import { IComboboxItem } from './combobox.types';
import { useComboboxControls } from './comboboxHelpers';
import { PortalBody } from './PortalBody';
import { useSlateAutocompleteExtensionOptions } from './slateAutocompleteExtension';
import { setElementPositionByRange } from './slateHelpers';

export interface ComboboxContainerProps {
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

  const editor = useSlateStatic();
  useEffect(() => {
    editor && setElementPositionByRange(editor, { ref, at: targetRange });
  }, [targetRange, editor]);

  const multiRef = mergeRefs([menuProps.ref, ref]);
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
                    targetRange: item.targetRange ?? targetRange!,
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
