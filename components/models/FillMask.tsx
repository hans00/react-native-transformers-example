import React, { useState, useEffect, useCallback } from 'react';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';

export const title = 'Masked language';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>('The goal of life is [MASK].');
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const predicts = await runPipe('fill-mask', model, input, params);
      setOutput(predicts.map(({ sequence }) => sequence).join('\n'));
    } catch {}
    setWIP(false);
  }, [model, input, params]);

  return (
    <>
      <TextField
        title="Input"
        value={input}
        onChange={setInput}
        multiline
      />
      <TextField
        title="Output"
        value={output}
        editable={false}
        multiline
      />
      <Button
        title="Generate"
        onPress={call}
        disabled={isWIP}
      />
    </>
  )
}
