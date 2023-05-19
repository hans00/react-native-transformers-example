import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';
import { useColor } from '../../utils/style';

export const title = 'Text Generation';

interface Props {
  onChange: (settings: object) => void;
}

export function Settings(props: Props): JSX.Element {
  const color = useColor('foreground');
  const textColor = { color };
  return (
    <>
      <Text style={textColor}>Nothing</Text>
    </>
  )
}

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

const sampleText = 'I enjoy walking with my cute dog,'

export function Interact({ settings, params, runPipe }: InteractProps): JSX.Element {
  const [text, setText] = useState<string>(sampleText);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ generated_text }] = await runPipe('text-generation', text, params);
      setText(generated_text);
    } catch {}
    setWIP(false);
  }, [text, settings, params]);

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
