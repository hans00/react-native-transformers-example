import React, { useState, useEffect, useCallback } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';

export const title = 'Image Classification';

export { default as Settings } from './common/Empty';

export { default as Parameters } from './common/Empty';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

interface LabelScore {
  label: string;
  score: number;
}

export function Interact({ runPipe }: InteractProps): JSX.Element {
  const [results, setResults] = useState<LabelScore[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      const predicts = await runPipe('image-classification', input);
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, []);

  const takePhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchCamera();
    call(uri);
  }, []);

  const selectPhoto = useCallback(async () => {
    const { assets: [ { uri } ] } = await launchImageLibrary();
    call(uri);
  }, []);

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
      {results.map(({ label, score }) => (
        <Progress key={label} title={label} value={score} />
      ))}
    </>
  )
}
