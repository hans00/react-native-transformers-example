import React, { useState, useCallback } from 'react';
import { Image, StyleSheet } from 'react-native';
import Button from '../form/Button';
import Progress from '../Progress';
import { usePhoto } from '../../utils/photo';
import type { InteractProps } from './common/types';

export const title = 'Image Classification';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

interface LabelScore {
  label: string;
  score: number;
}

export function Interact({ settings: { model }, runPipe }: InteractProps): React.JSX.Element {
  const [image, setImage] = useState<string|null>(null);
  const [results, setResults] = useState<LabelScore[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input: any) => {
    setWIP(true);
    try {
      const predicts = await runPipe('image-classification', model, null, input);
      setImage(input);
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, [model, runPipe]);

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
      {results.map(({ label, score }) => (
        <Progress key={label} title={`${label} (${(score * 100).toFixed()}%)`} value={score} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
});
