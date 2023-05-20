import React, { useState, useEffect, useCallback } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { StyleSheet, Image } from 'react-native';
import TextField from '../form/TextField';
import BooleanField from '../form/BooleanField';
import Button from '../form/Button';
import Progress from '../Progress';

export const title = 'Zero Shot Image Classification';

export { default as Settings } from './common/Empty';

interface Props {
  onChange: (settings: object) => void;
}

export function Parameters(props: Props) {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    multi_label: false,
  });

  useEffect(() => {
    onChange(params)
  }, [params])

  return (
    <>
      <BooleanField
        title="Multi label"
        value={params.multi_label}
        onChange={(value) => setParams({ ...params, multi_label: value })}
      />
    </>
  )
}

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

interface Label {
  label: string;
  score: number;
}

const sampleClass = 'phone, tablet, microwave, controller, remoter, pen, cutter';

export function Interact({ runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string|null>(null);
  const [classes, setClasses] = useState<string>(sampleClass);
  const [result, setResult] = useState<Label[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const { labels, scores } = await runPipe(
        'zero-shot-image-classification',
        input,
        classes.split(/\s*,+\s*/g).filter(x => x)
      );
      const predicts = labels.map((label, index) => ({
        label,
        score: scores[index],
      }));
      setResult(predicts);
    } catch {}
    setWIP(false);
  }, [input, classes]);

  const takePhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchCamera();
    setInput(uri);
  }, []);

  const selectPhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchImageLibrary();
    setInput(uri);
  }, []);

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
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
  },
});
