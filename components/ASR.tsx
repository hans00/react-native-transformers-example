import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import SelectField from './form/SelectField';
import TextField from './form/TextField';
import NumberField from './form/NumberField';
import BooleanField from './form/BooleanField';
import Button from './form/Button';
import Recorder from '../utils/recorder';

interface Props {
  onChange: (settings: object) => void;
}

export function Settings(props: Props): JSX.Element {
  return (
    <>
      <Text>Nothing</Text>
    </>
  )
}

export { default as Parameters } from './LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ settings, params, runPipe }: InteractProps): JSX.Element {
  const [output, setOutput] = useState<string>('');
  const [isRecording, setRecording] = useState<boolean>(false);
  const recorder = useRef<Nullable<Recorder>>(null);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input) => {
    try {
      setWIP(true);
      const { text } = await runPipe('automatic-speech-recognition', new Float32Array(input), params);
      setOutput(text);
      setWIP(false);
    } catch {
      setWIP(false);
    }
  }, [settings, params]);

  const startRecord = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Error', 'Microphone permission denied');
        return;
      }
    }
    recorder.current = new Recorder();
    await recorder.current.start();
    setRecording(true);
  }, []);

  const stopRecord = useCallback(async () => {
    const result = await recorder.current?.stop();
    setRecording(false);
    if (result?.length) call(result);
  }, [call]);

  useEffect(() => () => {
    recorder.current?.stop();
  }, []);

  return (
    <>
      <Button
        title="Start Record"
        onPress={startRecord}
        disabled={isRecording || isWIP}
      />
      <Button
        title="Stop & Inference"
        onPress={stopRecord}
        disabled={!isRecording || isWIP}
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
