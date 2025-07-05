import React, { useState, useEffect } from 'react';
import TextField from '../../form/TextField';
import type { Settings } from './types';

interface Props {
  onChange: (settings: Settings) => void;
}

export default function Settings({ onChange }: Props): React.JSX.Element {
  const [ model, setModel ] = useState<string>('');

  useEffect(() => {
    onChange({ model });
  }, [model, onChange]);

  return (
    <>
      <TextField
        title="Model"
        value={model}
        placeholder="(default)"
        onChange={setModel}
      />
    </>
  );
}
