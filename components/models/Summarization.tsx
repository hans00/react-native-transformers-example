import React, { useState, useEffect, useCallback } from 'react';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';

export const title = 'Summarization';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

const sampleText = `The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct.`;

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>(sampleText);
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ summary_text: text }] = await runPipe('summarization', model, null, input, params);
      setOutput(text);
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
