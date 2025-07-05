import React, { useState, useCallback } from 'react';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';
import type { InteractProps } from './common/types';

export const title = 'Text Classification';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

interface LabelScore {
  label: string;
  score: number;
}

const sampleText = 'The Shawshank Redemption is a true masterpiece of cinema, a movie that deserves every bit of its status as one of the greatest films ever made. From its stellar performances to its unforgettable storytelling, everything about this film is a testament to the power of great filmmaking.';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>(sampleText);
  const [labels, setLabels] = useState<LabelScore[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const predicts = await runPipe('text-classification', model, null, input, params);
      setLabels(predicts);
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
      <Button
        title="Predict"
        onPress={call}
        disabled={isWIP}
      />
      {labels.map(({ label, score }) => (
        <Progress key={label} title={label} value={score} />
      ))}
    </>
  );
}
