import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, Platform, Alert } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import RNFS from 'react-native-fs';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import { encodeBuffer } from '../../utils/audio';

export const title = 'Test To Speech';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props): JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    speaker_embeddings: 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin',
  });

  useEffect(() => {
    onChange(params)
  }, [params])

  return (
    <>
      <TextField
        title="Speaker Embeddings"
        value={params.speaker_embeddings}
        onChange={(value) => setParams({ ...params, speaker_embeddings: value })}
      />
    </>
  )
};

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

const sampleText = 'Hello, my dog is cute';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [text, setText] = useState<string>(sampleText);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const { audio, sampling_rate } = await runPipe('text-to-speech', model, text, params);
      const file = `${RNFS.CachesDirectoryPath}/tts-${Date.now()}.wav`;
      await RNFS.writeFile(
        file,
        encodeBuffer({ data: audio, sampleRate: sampling_rate, channels: 1 }).toString('base64'),
        'base64',
      );
      setOutput(file);
    } catch {}
    setWIP(false);
  }, [model, text, params]);

  const play = useCallback(() => {
    if (!output) return;
    SoundPlayer.playUrl(output);
  }, [output]);

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
      <Button
        title="Play"
        onPress={play}
        disabled={isWIP || !output}
      />
    </>
  )
}
