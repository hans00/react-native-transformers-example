import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import type { RawAudio } from '@huggingface/transformers';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';
import InlineSection from '../form/InlineSection';
import Section from '../form/Section';
import { decodeBuffer, toSingleChannel, downsample, toFloatArray, play } from '../../utils/audio';
import { getFile } from '../../utils/fs-cache';
import type { InteractProps } from './common/types';

export const title = 'Speech Recognition';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

const examples = {
  'Example 1': 'https://huggingface.github.io/transformers.js/audio/jfk.wav',
  'Example 2': 'https://huggingface.github.io/transformers.js/audio/ted.wav',
  'Example 3': 'https://huggingface.github.io/transformers.js/audio/ted_60.wav',
};

export function Interact({ settings: { model }, params, runPipe }: InteractProps): React.JSX.Element {
  const [output, setOutput] = useState<string>('');
  const [isRecording, setRecording] = useState<boolean>(false);
  const recorder = useRef<Recorder|null>(null);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [example, setExample] = useState<string>(Object.values(examples)[0]);

  const call = useCallback(async (audio: RawAudio | Float32Array| string) => {
    setWIP(true);
    try {
      const { text } = await runPipe('automatic-speech-recognition', model, null, audio, params);
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [model, params, runPipe]);

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
    try {
      const result = await recorder.current?.stop();
      setRecording(false);
      if (result) {
        call(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [call]);

  useEffect(() => () => {
    recorder.current?.stop();
  }, []);

  const runExample = useCallback(async () => {
    try {
      if (!example) {return;}
      const file = await getFile(example);
      const audio = await decodeBuffer(Buffer.from(await RNFS.readFile(file, 'base64'), 'base64'));
      call(toFloatArray(downsample(toSingleChannel(audio), 16000).data));
    } catch (e) {
      console.error(e);
    }
  }, [call, example]);

  const playExample = useCallback(async () => {
    if (!example) {return;}
    play(example);
  }, [example]);

  return (
    <>
      <InlineSection title="Run on example">
        <SelectField
          value={example}
          options={Object.entries(examples).map(([key, value]) => ({ label: key, value }))}
          onChange={setExample}
        />
        <Button
          title="Run"
          onPress={runExample}
          disabled={isWIP}
        />
        <Button
          title="Play"
          onPress={playExample}
        />
      </InlineSection>
      <InlineSection title="Record">
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
      </InlineSection>
      <Section title="Output">
        <TextField
          value={output}
          editable={false}
          multiline
        />
      </Section>
    </>
  );
}
