import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import uniqolor from 'uniqolor';
import { Canvas, Image, useImage, Text, Rect } from '@shopify/react-native-skia';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';
import { getImageData, createRawImage, calcPosition } from '../../utils/image';
import { usePhoto } from '../../utils/photo';
import { log } from '../../utils/logger';

export const title = 'Object Detection';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

interface Result {
  boxe: { ymin: number, ymax: number, xmin: number, xmax: number };
  label: string;
  score: number;
}

export function Interact({ settings: { model }, runPipe }: InteractProps): JSX.Element {
  const [results, setResults] = useState<Result[]>(null);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const img = useImage(input);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      setInput(input);
      const data = await getImageData(input);
      const predicts = await runPipe('object-detection', model, createRawImage(data));
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, [model]);

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
      <Canvas
        style={styles.canvas}
        onLayout={(e) => setSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })}
        onSize={(width, height) => setSize({ width, height })}
      >
        <Image
          image={img}
          fit="contain"
          x={0}
          y={0}
          width={size.width}
          height={size.height}
        />
        {results?.map(({ box: { xmin, ymin, xmax, ymax }, label, score }, i) => {
          const { color } = uniqolor(label, { lightness: 50 });
          const [x, y, w, h] = calcPosition(
            'contain',
            size.width, size.height,
            img.width(), img.height(),
            xmin, ymin, xmax, ymax,
          );
          return (
            <>
              <Rect
                key={`rect-${i}`}
                x={x}
                y={y}
                width={w}
                height={h}
                color={color}
                strokeWidth={2}
              />
              <Text
                key={`text-${i}`}
                x={x > 10 ? x : x + 4}
                y={y > 10 ? y - 5 : y + 16}
                text={`${label} ${score.toFixed(2)}`}
                color={color}
                fontSize={16}
              />
            </>
          );
        })}
      </Canvas>
    </>
  )
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 512,
  },
});
