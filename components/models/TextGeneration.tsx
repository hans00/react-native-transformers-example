import React, { useState, useEffect, useCallback } from 'react';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import Button from '../form/Button';
import type { InteractProps } from './common/types';

export const title = 'Text Generation';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props): JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    topk: 5,
    max_new_tokens: 50,
  });

  useEffect(() => {
    onChange(params);
  }, [params, onChange]);

  return (
    <>
      <NumberField
        title="No. samples"
        value={params.topk}
        onChange={(value) => setParams({ ...params, topk: value })}
      />
      <NumberField
        title="Max length"
        value={params.max_new_tokens}
        onChange={(value) => setParams({ ...params, max_new_tokens: value })}
      />
    </>
  );
}

const sampleText = 'I enjoy walking with my cute dog,';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [text, setText] = useState<string>(sampleText);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ generated_text }] = await runPipe('text-generation', model, null, text, params);
      setText(generated_text);
    } catch {}
    setWIP(false);
  }, [model, text, params, runPipe]);

  return (
    <>
      <TextField
        title="Text"
        value={text}
        onChange={setText}
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
