import React, { useState, useEffect, useCallback } from 'react';
import TextField from '../form/TextField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Progress from '../Progress';
import type { InteractProps } from './common/types';

export const title = 'Zero Shot Classification';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props) {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    multi_label: false,
  });

  useEffect(() => {
    onChange(params);
  }, [params, onChange]);

  return (
    <>
      <BooleanField
        title="Multi label"
        value={params.multi_label}
        onChange={(value) => setParams({ ...params, multi_label: value })}
      />
    </>
  );
}

interface Label {
  label: string;
  score: number;
}

const sampleText = 'I have a problem with my iphone that needs to be resolved asap!';
const sampleClass = 'urgent, not urgent, phone, tablet, microwave';

export function Interact({ settings: { model }, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>(sampleText);
  const [classes, setClasses] = useState<string>(sampleClass);
  const [result, setResult] = useState<Label[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const { labels, scores } = await runPipe(
        'zero-shot-classification',
        model,
        null,
        input,
        classes.split(/\s*,+\s*/g).filter(x => x)
      );
      const predicts = labels.map((label, index) => ({
        label,
        score: scores[index],
      }));
      setResult(predicts);
    } catch {}
    setWIP(false);
  }, [model, input, classes, runPipe]);

  return (
    <>
      <TextField
        title="Possible class names (comma-separated)"
        value={classes}
        onChange={setClasses}
      />
      <TextField
        title="Text"
        value={input}
        onChange={setInput}
        multiline
      />
      <Button
        title="Predict"
        onPress={call}
        disabled={isWIP}
      />
      {result.map(({ label, score }) => (
        <Progress key={label} title={label} value={score} />
      ))}
    </>
  );
}
