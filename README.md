# Slate Autocomplete

[Demo](https://slate-autocomplete.netlify.app/)

Implementation of autocomplete in SlateJS built on top of [use slate with extensions](https://github.com/lukesmurray/use-slate-with-extensions). The implementation is inspired by code from [slate-plugins](https://github.com/udecode/slate-plugins).

```tsx
import {
  ComboboxContainer,
  onSearchCallback,
  useSearchAfterWordBoundaries,
  useSlateAutocompleteExtension,
} from '../.';
import { Editable, Slate } from 'slate-react';
import { Transforms } from 'slate';
import { useSlateWithExtensions } from 'use-slate-with-extensions';

const ExampleEditor = () => {
  // use this handler if you want slash command style autocomplete
  // const autocompleteOnChange = useSearchAfterTrigger({
  //   trigger: '/',
  //   maxSuggestions: 10,
  //   autocompleteOnSearch,
  // });

  // use this handler if you want autocomplete after spaces
  const autocompleteOnChange = useSearchAfterWordBoundaries({
    boundaryRegex: '^|\\s',
    farthestToCloset: true,
    maxBoundaries: 2,
    maxSuggestions: 10,
    onSearch: autocompleteOnSearch,
  });

  // handler for when an item is selected
  const autocompleteOnSelectItem = (editor, options) => {
    Transforms.insertText(editor, options.item.text, {
      at: options.targetRange,
    });
  };

  // create the extension, separate combobox props from the plugin
  const {
    getComboBoxContainerProps,
    ...plugin
  } = useSlateAutocompleteExtension({
    autocompleteOnChange: autocompleteOnChange,
    onSelectItem: autocompleteOnSelectItem,
  }

  const { getEditableProps, getSlateProps } = useSlateWithExtensions({
    extensions: [plugin],
  });

  return (
    <Slate {...getSlateProps()}>
      <Editable {...getEditableProps()} />
      {/* render the combobox */}
      <ComboboxContainer {...getComboBoxContainerProps()} />
    </Slate>
  );
};

const fakeData = [
  { text: 'Turner Hader' },
  { text: 'Hand Group' },
  { text: 'Haag Inc' },
];
```
