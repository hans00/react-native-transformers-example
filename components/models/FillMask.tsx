import React, { useState, useCallback } from 'react';
import TextField from '../form/TextField';
import Button from '../form/Button';
import type { InteractProps } from './common/types';

export const title = 'Masked language';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): React.JSX.Element {
  const [input, setInput] = useState<string>('The goal of life is [MASK].');
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const predicts = await runPipe('fill-mask', model, null, input, params);
      setOutput(predicts.map(({ sequence }: { sequence: string }) => sequence).join('\n'));
    } catch {}
    setWIP(false);
  }, [model, input, params, runPipe]);

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
  );
}
