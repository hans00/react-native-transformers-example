import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, PermissionsAndroid, Platform, Alert } from 'react-native';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';
import InlineSection from '../form/InlineSection';
import Section from '../form/Section';
import { useColor } from '../../utils/style';
import { decodeBuffer, toSingleChannel, downsample, play } from '../../utils/audio';
import { getFile } from '../../utils/fs-cache';
import * as logger from '../../utils/logger';

export const title = 'Speech Recognition';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

const examples = {
  'Example 1': 'https://xenova.github.io/transformers.js/audio/jfk.wav',
  'Example 2': 'https://xenova.github.io/transformers.js/audio/ted.wav',
  'Example 3': 'https://xenova.github.io/transformers.js/audio/ted_60.wav',
}

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [output, setOutput] = useState<string>('');
  const [isRecording, setRecording] = useState<boolean>(false);
  const recorder = useRef<Nullable<Recorder>>(null);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [example, setExample] = useState<string>(Object.values(examples)[0]);

  const call = useCallback(async (audio) => {
    setWIP(true);
    try {
      logger.time('TRANSFORM');
      audio = downsample(toSingleChannel(audio), 16000);
      logger.timeEnd('TRANSFORM');
      const { text } = await runPipe('automatic-speech-recognition', model, null, audio.data, params);
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [model, params]);

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

  const runExample = useCallback(async () => {
    if (!example) return;
    const buf = await getFile(example);
    logger.time('DECODE');
    const audio = await decodeBuffer(buf);
    logger.timeEnd('DECODE');
    call(audio);
  }, [call, example]);

  const playExample = useCallback(async () => {
    if (!example) return;
    play(example);
  }, [example]);

  return (
    <>
      <InlineSection title="Run on example">
        <SelectField
          value={example}
          options={Object.values(examples)}
          optionLabels={Object.keys(examples)}
          onChange={setExample}
          width={150}
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
  )
}
