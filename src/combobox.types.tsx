import { Range } from 'slate';

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
  itemType?: 'normal' | 'divide' | 'header';

  /**
   * Whether the option is disabled
   * @defaultvalue false
   */
  disabled?: boolean;

  /**
   * optional target range for this combobox if it differs from target range
   * of general combo box
   */
  targetRange?: Range;

  /**
   * Data available to onRenderItem.
   */
  data?: unknown;
}

export interface RenderFunction<P = { [key: string]: any }> {
  (
    props: P,
    defaultRender?: (props?: P) => JSX.Element | null
  ): JSX.Element | null;
}

export interface ComboboxItemProps {
  item: IComboboxItem;
}
