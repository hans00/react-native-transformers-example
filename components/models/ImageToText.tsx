import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import NumberField from '../form/NumberField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Recorder from '../../utils/recorder';
import { useColor } from '../../utils/style';
import { usePhoto } from '../../utils/photo';

export const title = 'Image to Text';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ settings: { model }, params, runPipe }: InteractProps): JSX.Element {
  const [image, setImage] = useState<string|null>(null);
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      const [{ generated_text: text }] = await runPipe('image-to-text', model, input, params);
      setImage(input);
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [model, params]);

  const { selectPhoto, takePhoto } = usePhoto((uri) => call(uri));

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
      {!isWIP && image && (
        <Image
          style={styles.image}
          source={{ uri: image }}
        />
      )}
      <TextField
        title="Output"
        value={output}
        editable={false}
        multiline
      />
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
});
