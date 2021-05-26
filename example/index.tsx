import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { Transforms } from 'slate';
import { Editable, Slate } from 'slate-react';
import { useSlateWithExtensions } from 'use-slate-with-extensions';
import {
  ComboboxContainer,
  onSearchCallback,
  useSearchAfterWordBoundaries,
  useSlateAutocompleteExtension,
} from '../.';
import './styles.css';

const autocompleteOnSearch: onSearchCallback = (
  search,
  maxSuggestions,
  options
) =>
  search.length === 0
    ? []
    : fakeData
        .filter(
          d =>
            d.text.toLocaleLowerCase().startsWith(search.toLocaleLowerCase()) &&
            d.text.toLocaleLowerCase() !== search.toLocaleLowerCase()
        )
        .filter((_, i) => i < maxSuggestions)
        .map(v => ({
          key: v.text,
          text: v.text,
          targetRange: options?.targetRange,
        }));

const ExampleEditor = () => {
  // const autocompleteOnChange = useSearchAfterTrigger({
  //   trigger: '/',
  //   maxSuggestions: 10,
  //   autocompleteOnSearch,
  // });

  const autocompleteOnChange = useSearchAfterWordBoundaries({
    boundaryRegex: '^|\\s',
    farthestToCloset: true,
    maxBoundaries: 2,
    maxSuggestions: 10,
    onSearch: autocompleteOnSearch,
  });

  const autocompleteOnSelectItem = (editor, options) => {
    Transforms.insertText(editor, options.item.text, {
      at: options.targetRange,
    });
  };
  const {
    getComboBoxContainerProps,
    ...plugin
  } = useSlateAutocompleteExtension({
    autocompleteOnChange: autocompleteOnChange,
    onSelectItem: autocompleteOnSelectItem,
  });

  const { getEditableProps, getSlateProps } = useSlateWithExtensions({
    extensions: [plugin],
  });

  return (
    <Slate {...getSlateProps()}>
      <Editable {...getEditableProps()} />
      <ComboboxContainer {...getComboBoxContainerProps()} />
    </Slate>
  );
};

const App = () => {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'grid',
        gridTemplateRows: 'min-content 1fr',
      }}
    >
      <header>
        {' '}
        <h2>Slate Autocomplete</h2>{' '}
        <p>
          {' '}
          Implementation of autocomplete in SlateJS inspired by{' '}
          <a href="https://github.com/udecode/slate-plugins">
            slate-plugins
          </a>{' '}
          combobox example. The package exposes logic for rendering an
          autocomplete dropdown as well as some autocomplete algorithms to
          support common autocomplete implementations{' '}
        </p>{' '}
      </header>{' '}
      <ExampleEditor />{' '}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

const fakeData = [
  { text: "Adams, O'Connell and Oberbrunner" },
  { text: "D'Amore-O'Connell" },
  { text: "O'Keefe, Moen and Anderson" },
  { text: 'Beahan Group' },
  { text: 'Bednar, Shields and Denesik' },
  { text: 'Beier-Hermiston' },
  { text: 'Boyer, Armstrong and Purdy' },
  { text: 'Boyer-Blanda' },
  { text: 'Boyle-Purdy' },
  { text: 'Brakus Inc' },
  { text: 'Brown Group' },
  { text: 'Cartwright LLC' },
  { text: 'Casper-Kunze' },
  { text: 'Connelly Inc' },
  { text: 'Cronin and Sons' },
  { text: 'Cummerata-Gaylord' },
  { text: 'Cummings and Sons' },
  { text: 'Dach-West' },
  { text: 'Daniel-Macejkovic' },
  { text: 'Dare Group' },
  { text: 'Daugherty Group' },
  { text: 'Daugherty, Wilderman and Crooks' },
  { text: 'Dooley, Bashirian and Ward' },
  { text: 'DuBuque, Torphy and Harber' },
  { text: 'DuBuque-Stark' },
  { text: 'Ernser, Brown and Connelly' },
  { text: 'Ernser-Pacocha' },
  { text: 'Fadel LLC' },
  { text: 'Farrell LLC' },
  { text: 'Ferry, Weissnat and Cole' },
  { text: 'Fisher-Keebler' },
  { text: 'Franecki-Waters' },
  { text: 'Friesen, Connelly and Schmitt' },
  { text: 'Goyette and Sons' },
  { text: 'Greenholt, Jerde and Keebler' },
  { text: 'Gutmann, Durgan and Rogahn' },
  { text: 'Haag Inc' },
  { text: 'Hand Group' },
  { text: 'Heaney, Haley and Ratke' },
  { text: 'Huels Group' },
  { text: 'Hyatt Group' },
  { text: 'Hyatt-Walsh' },
  { text: 'Jast, Towne and Denesik' },
  { text: 'Jenkins, Fritsch and Schneider' },
  { text: 'Johnston Inc' },
  { text: 'Jones-Macejkovic' },
  { text: 'Kerluke, Abshire and Ondricka' },
  { text: 'Kerluke, Moen and Waters' },
  { text: 'Kirlin Group' },
  { text: 'Krajcik LLC' },
  { text: 'Kuhn-Yost' },
  { text: 'Kunde, Grimes and Schumm' },
  { text: 'Leannon Inc' },
  { text: 'Leannon and Sons' },
  { text: 'Lesch-Shanahan' },
  { text: 'Lind and Sons' },
  { text: 'Lowe, Aufderhar and Breitenberg' },
  { text: 'Luettgen-Rath' },
  { text: 'Mann-Wehner' },
  { text: 'McGlynn-Lesch' },
  { text: 'Medhurst-Hegmann' },
  { text: 'Metz, Schmeler and Mante' },
  { text: 'Moen-Cole' },
  { text: 'Moen-Ryan' },
  { text: 'Mohr Inc' },
  { text: 'Mohr and Sons' },
  { text: 'Morissette-Heathcote' },
  { text: 'Nienow, Bayer and Schumm' },
  { text: 'Nolan, Brakus and Mitchell' },
  { text: 'Oberbrunner LLC' },
  { text: 'Ortiz-Brown' },
  { text: 'Prohaska Inc' },
  { text: 'Quigley, Keeling and Marks' },
  { text: 'Rau, Wyman and Hane' },
  { text: 'Rau-Bahringer' },
  { text: 'Reinger Inc' },
  { text: 'Reynolds, Batz and Kiehn' },
  { text: 'Rowe, Marquardt and Maggio' },
  { text: 'Ruecker-Lindgren' },
  { text: 'Runolfsdottir and Sons' },
  { text: 'Runolfsdottir-Hansen' },
  { text: 'Schaefer and Sons' },
  { text: 'Schimmel Inc' },
  { text: 'Skiles Group' },
  { text: 'Stamm-Goldner' },
  { text: 'Stanton-Beatty' },
  { text: 'Stark Group' },
  { text: 'Thiel, Cassin and Terry' },
  { text: 'Tillman LLC' },
  { text: 'Torphy-Daugherty' },
  { text: 'Towne, Pfannerstill and Connelly' },
  { text: 'Toy-Kuhn' },
  { text: 'Turcotte-Hudson' },
  { text: 'Turner, Schultz and Nader' },
  { text: 'Ullrich Inc' },
  { text: 'Vandervort, Hessel and Nicolas' },
  { text: 'Walter Group' },
  { text: 'Weimann-Grady' },
  { text: 'West, Fay and Herman' },
  { text: 'Zulauf LLC' },
];
