import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { Editable, Slate } from 'slate-react';
import {
  useSlateState,
  useSlateWithExtensions,
} from 'use-slate-with-extensions';
import { useSlateAutocompleteExtension } from '../.';
import './styles.css';

const Editor = () => {
  const [value, onChange] = useSlateState();

  const plugin = useSlateAutocompleteExtension();

  const { getEditableProps, getSlateProps } = useSlateWithExtensions({
    onChange,
    value,
    extensions: [plugin],
  });

  return (
    <Slate {...getSlateProps()}>
      <Editable {...getEditableProps()} />
    </Slate>
  );
};

const App = () => {
  return (
    <div style={{ minHeight: '100%' }}>
      <Editor />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
