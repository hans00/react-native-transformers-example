import React, { useState, useEffect, useCallback } from 'react';
import RNFS from 'react-native-fs';
import TextField from '../form/TextField';
import Button from '../form/Button';
import { encodeBuffer, play } from '../../utils/audio';
import type { InteractProps, Settings } from './common/types';

export const title = 'Text To Speech';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: Settings) => void;
}

export function Parameters(props: Props): React.JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<Settings>({
    speaker_embeddings: 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin',
  });

  useEffect(() => {
    onChange(params);
  }, [params, onChange]);

  return (
    <>
      <TextField
        title="Speaker Embeddings"
        value={(params as any).speaker_embeddings}
        onChange={(value) => setParams({ ...params, speaker_embeddings: value })}
      />
    </>
  );
}

const sampleText = 'How are you';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): React.JSX.Element {
  const [text, setText] = useState<string>(sampleText);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');

  const clear = useCallback(async () => {
    if (!output) {return;}
    await RNFS.unlink(output);
    setOutput('');
  }, [output]);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      await clear();
      const { audio, sampling_rate } = await runPipe(
        'text-to-speech',
        model,
        { dtype: 'float32' },
        text,
        params,
      );
      const file = `${RNFS.TemporaryDirectoryPath}/tts-${Date.now()}.wav`;
      await RNFS.writeFile(
        file,
        encodeBuffer({ data: audio, sampleRate: sampling_rate, channels: 1 }).toString('base64'),
        'base64',
      );
      setOutput(file);
    } catch {}
    setWIP(false);
  }, [clear, model, text, params, runPipe]);

  const playAudio = useCallback(() => {
    if (!output) {return;}
    play(output);
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
        onPress={playAudio}
        disabled={isWIP || !output}
      />
      <Button
        title="Clear"
        onPress={clear}
        disabled={isWIP || !output}
      />
    </>
  );
}
