import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';
import { useColor } from '../../utils/style';

export const title = 'Image to Text';

export { default as Settings } from './common/Empty';

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ params, runPipe }: InteractProps): JSX.Element {
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      const [{ generated_text: text }] = await runPipe('image-to-text', input, params);
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [params]);

  const takePhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchCamera();
    call(uri);
  }, []);

  const selectPhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchImageLibrary();
    call(uri);
  }, []);

  return (
    <>
      <Button
        title="Take Photo & Inference"
        onPress={takePhoto}
        disabled={isWIP}
      />
      <Button
        title="Select Photo & Inference"
        onPress={selectPhoto}
        disabled={isWIP}
      />
      <TextField
        title="Output"
        value={output}
        editable={false}
        multiline
      />
    </>
  )
}
