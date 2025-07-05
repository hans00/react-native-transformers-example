import React, { useState, useCallback } from 'react';
import { Image, StyleSheet } from 'react-native';
import TextField from '../form/TextField';
import Button from '../form/Button';
import { usePhoto } from '../../utils/photo';
import type { InteractProps } from './common/types';

export const title = 'Image to Text';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/LMParameters';

export function Interact({ settings: { model }, params, runPipe }: InteractProps): React.JSX.Element {
  const [image, setImage] = useState<string|null>(null);
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input: any) => {
    setWIP(true);
    try {
      const [{ generated_text: text }] = await runPipe('image-to-text', model, null, input, params);
      setImage(input);
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [model, params, runPipe]);

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
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
});
