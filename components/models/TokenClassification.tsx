import React, { useState, useCallback } from 'react';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';
import type { InteractProps } from './common/types';

export const title = 'Token Classification';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

interface Token {
  start: number | null;
  end: number | null;
  entity: string;
  index: number;
  word: string;
  score: number;
}

const sampleText = 'Hugging Face is a technology company that was founded in 2016 by Clément Delangue, Julien Chaumond, and Thomas Wolf. The company is headquartered in New York City, and is focused on developing natural language processing software and tools.';

export function Interact({ settings: { model }, runPipe }: InteractProps): React.JSX.Element {
  const [input, setInput] = useState<string>(sampleText);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const predicts = await runPipe('token-classification', model, null, input);
      setTokens(predicts);
    } catch {}
    setWIP(false);
  }, [model, input, runPipe]);

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
      {tokens.map(({ index, entity, word, score }) => (
        <Progress key={index} title={`${word} [${entity}]`} value={score} />
      ))}
    </>
  );
}
