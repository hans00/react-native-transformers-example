import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Image } from 'react-native';
import TextField from '../form/TextField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Progress from '../Progress';
import { getImageData, createRawImage } from '../../utils/image';
import { usePhoto } from '../../utils/photo';
import type { InteractProps } from './common/types';

export const title = 'Zero Shot Image Classification';

export { default as Settings } from './common/Settings';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props) {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    multi_label: false,
  });

  useEffect(() => {
    onChange(params);
  }, [params, onChange]);

  return (
    <>
      <BooleanField
        title="Multi label"
        value={params.multi_label}
        onChange={(value) => setParams({ ...params, multi_label: value })}
      />
    </>
  );
}

interface Label {
  label: string;
  score: number;
}

const sampleClass = 'phone, tablet, microwave, controller, remoter, pen, cutter';

export function Interact({ settings: { model }, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string|null>(null);
  const [classes, setClasses] = useState<string>(sampleClass);
  const [result, setResult] = useState<Label[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);
  const inferImage = useRef<any>(null);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const predicts = await runPipe(
        'zero-shot-image-classification',
        model,
        null,
        createRawImage(inferImage.current),
        classes.split(/\s*,+\s*/g).filter(x => x)
      );
      setResult(predicts);
    } catch {}
    setWIP(false);
  }, [model, classes, runPipe]);

  const { selectPhoto, takePhoto } = usePhoto(async (uri) => {
    inferImage.current = await getImageData(uri, 512);
    setInput(uri);
  });

  return (
    <>
      <TextField
        title="Possible class names (comma-separated)"
        value={classes}
        onChange={setClasses}
      />
      <Button
        title="Take Photo"
        onPress={takePhoto}
        disabled={isWIP}
      />
      <Button
        title="Select Photo"
        onPress={selectPhoto}
        disabled={isWIP}
      />
      <Image
        source={{ uri: input }}
        style={styles.image}
      />
      <Button
        title="Inference"
        onPress={call}
        disabled={isWIP}
      />
      {result.map(({ label, score }) => (
        <Progress key={label} title={label} value={score} />
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
