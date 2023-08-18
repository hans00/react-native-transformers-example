import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';

export const title = 'Text Generation';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props): JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    topk: 5,
  });

  useEffect(() => {
    onChange(params)
  }, [params])

  return (
    <>
      <NumberField
        title="No. samples"
        value={params.topk}
        onChange={(value) => setParams({ ...params, topk: value })}
      />
    </>
  )
};

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

const sampleText = 'I enjoy walking with my cute dog,'

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [text, setText] = useState<string>(sampleText);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ generated_text }] = await runPipe('text-generation', model, text, params);
      setText(generated_text);
    } catch {}
    setWIP(false);
  }, [model, text, params]);

  return (
    <>
      <TextField
        title="Text"
        value={text}
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
