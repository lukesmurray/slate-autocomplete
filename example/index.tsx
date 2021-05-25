import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { Transforms } from 'slate';
import { Editable, Slate } from 'slate-react';
import {
  useSlateState,
  useSlateWithExtensions,
} from 'use-slate-with-extensions';
import { ComboboxContainer, useSlateAutocompleteExtension } from '../.';
import './styles.css';

const ExampleEditor = () => {
  const [value, onChange] = useSlateState();

  const {
    getComboBoxContainerProps,
    ...plugin
  } = useSlateAutocompleteExtension({
    autocompleteOnChange: (editor, { maxSuggestions, search, setItems }) => {
      setItems(
        fakeData
          .filter(d =>
            d.text.toLocaleLowerCase().startsWith(search.toLocaleLowerCase())
          )
          .filter((v, i) => i < maxSuggestions)
      );
    },
    onSelectItem: (editor, options) => {
      Transforms.insertText(editor, options.item.text, {
        at: options.targetRange,
      });
    },
    trigger: '/',
  });

  const { getEditableProps, getSlateProps } = useSlateWithExtensions({
    onChange,
    value,
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
    <div style={{ minHeight: '100%' }}>
      <ExampleEditor />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

const fakeData = [
  {
    text: 'Turner, Schultz and Nader',
  },
  {
    text: 'Hand Group',
  },
  {
    text: 'Haag Inc',
  },
  {
    text: 'Runolfsdottir-Hansen',
  },
  {
    text: 'Zulauf LLC',
  },
  {
    text: 'Schimmel Inc',
  },
  {
    text: 'Jones-Macejkovic',
  },
  {
    text: 'Cummerata-Gaylord',
  },
  {
    text: 'Beahan Group',
  },
  {
    text: 'Lesch-Shanahan',
  },
  {
    text: 'Torphy-Daugherty',
  },
  {
    text: 'Beier-Hermiston',
  },
  {
    text: 'Toy-Kuhn',
  },
  {
    text: 'Daugherty Group',
  },
  {
    text: 'Boyle-Purdy',
  },
  {
    text: 'Leannon and Sons',
  },
  {
    text: 'Gutmann, Durgan and Rogahn',
  },
  {
    text: 'Farrell LLC',
  },
  {
    text: 'Stark Group',
  },
  {
    text: 'Dare Group',
  },
  {
    text: 'Goyette and Sons',
  },
  {
    text: 'Stanton-Beatty',
  },
  {
    text: 'Vandervort, Hessel and Nicolas',
  },
  {
    text: 'Turcotte-Hudson',
  },
  {
    text: 'Cummings and Sons',
  },
  {
    text: 'Nienow, Bayer and Schumm',
  },
  {
    text: 'Skiles Group',
  },
  {
    text: "O'Keefe, Moen and Anderson",
  },
  {
    text: 'Kirlin Group',
  },
  {
    text: 'Schaefer and Sons',
  },
  {
    text: 'Daniel-Macejkovic',
  },
  {
    text: 'Towne, Pfannerstill and Connelly',
  },
  {
    text: 'Friesen, Connelly and Schmitt',
  },
  {
    text: 'Boyer, Armstrong and Purdy',
  },
  {
    text: 'Mohr Inc',
  },
  {
    text: 'Rowe, Marquardt and Maggio',
  },
  {
    text: 'Ernser, Brown and Connelly',
  },
  {
    text: 'Fisher-Keebler',
  },
  {
    text: 'Greenholt, Jerde and Keebler',
  },
  {
    text: 'Nolan, Brakus and Mitchell',
  },
  {
    text: 'Brakus Inc',
  },
  {
    text: 'Metz, Schmeler and Mante',
  },
  {
    text: 'Dach-West',
  },
  {
    text: 'Cronin and Sons',
  },
  {
    text: 'Cartwright LLC',
  },
  {
    text: 'Reynolds, Batz and Kiehn',
  },
  {
    text: 'Ferry, Weissnat and Cole',
  },
  {
    text: 'Hyatt-Walsh',
  },
  {
    text: 'Ruecker-Lindgren',
  },
  {
    text: 'Fadel LLC',
  },
  {
    text: 'Walter Group',
  },
  {
    text: 'Bednar, Shields and Denesik',
  },
  {
    text: 'Ullrich Inc',
  },
  {
    text: 'Quigley, Keeling and Marks',
  },
  {
    text: 'Kuhn-Yost',
  },
  {
    text: 'Brown Group',
  },
  {
    text: 'Stamm-Goldner',
  },
  {
    text: 'Lowe, Aufderhar and Breitenberg',
  },
  {
    text: 'Jast, Towne and Denesik',
  },
  {
    text: 'Huels Group',
  },
  {
    text: 'Oberbrunner LLC',
  },
  {
    text: 'Runolfsdottir and Sons',
  },
  {
    text: 'Franecki-Waters',
  },
  {
    text: "D'Amore-O'Connell",
  },
  {
    text: 'Luettgen-Rath',
  },
  {
    text: 'Jenkins, Fritsch and Schneider',
  },
  {
    text: 'Tillman LLC',
  },
  {
    text: 'Weimann-Grady',
  },
  {
    text: 'Rau-Bahringer',
  },
  {
    text: 'Boyer-Blanda',
  },
  {
    text: 'Dooley, Bashirian and Ward',
  },
  {
    text: 'Daugherty, Wilderman and Crooks',
  },
  {
    text: 'Johnston Inc',
  },
  {
    text: 'Leannon Inc',
  },
  {
    text: 'Hyatt Group',
  },
  {
    text: 'Mohr and Sons',
  },
  {
    text: 'Lind and Sons',
  },
  {
    text: 'Heaney, Haley and Ratke',
  },
  {
    text: 'West, Fay and Herman',
  },
  {
    text: 'Krajcik LLC',
  },
  {
    text: 'Kerluke, Moen and Waters',
  },
  {
    text: 'Prohaska Inc',
  },
  {
    text: 'Morissette-Heathcote',
  },
  {
    text: "Adams, O'Connell and Oberbrunner",
  },
  {
    text: 'DuBuque-Stark',
  },
  {
    text: 'Rau, Wyman and Hane',
  },
  {
    text: 'Reinger Inc',
  },
  {
    text: 'Ernser-Pacocha',
  },
  {
    text: 'Moen-Ryan',
  },
  {
    text: 'Casper-Kunze',
  },
  {
    text: 'Mann-Wehner',
  },
  {
    text: 'Moen-Cole',
  },
  {
    text: 'Thiel, Cassin and Terry',
  },
  {
    text: 'DuBuque, Torphy and Harber',
  },
  {
    text: 'Ortiz-Brown',
  },
  {
    text: 'Kerluke, Abshire and Ondricka',
  },
  {
    text: 'Connelly Inc',
  },
  {
    text: 'Kunde, Grimes and Schumm',
  },
  {
    text: 'Medhurst-Hegmann',
  },
  {
    text: 'McGlynn-Lesch',
  },
];
