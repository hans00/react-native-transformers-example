import React, { useState, useEffect } from 'react';
import TextField from '../../form/TextField';

interface Props {
  onChange: (settings: object) => void;
}

export default function Settings(props: Props): JSX.Element {
  const { onChange } = props;
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
