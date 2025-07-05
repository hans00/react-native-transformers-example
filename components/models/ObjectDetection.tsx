import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import uniqolor from 'uniqolor';
import { Canvas, Image, useImage, Text, Rect, Group, useFont } from '@shopify/react-native-skia';
import Button from '../form/Button';
import { getImageData, createRawImage, calcPosition } from '../../utils/image';
import { usePhoto } from '../../utils/photo';
import type { InteractProps } from './common/types';
import type { ObjectDetectionPipelineSingle } from '@huggingface/transformers';

export const title = 'Object Detection';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

export function Interact({ settings: { model }, runPipe }: InteractProps): React.JSX.Element {
  const [results, setResults] = useState<ObjectDetectionPipelineSingle[]|null>(null);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [inputImage, setInputImage] = useState<string>('');
  const img = useImage(inputImage);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const call = useCallback(async (input: string) => {
    setWIP(true);
    try {
      setResults(null);
      setInputImage(input);
      const data = await getImageData(input, 128);
      const predicts = await runPipe('object-detection', model, null, createRawImage(data));
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, [model, runPipe]);

  const { selectPhoto, takePhoto } = usePhoto((uri) => call(uri));

  const font = useFont('serif', 16);

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
        onSize={(width: number, height: number) => setSize({ width, height })}
      >
        <Image
          image={img}
          fit="contain"
          x={0}
          y={0}
          width={size.width}
          height={size.height}
        />
        {results?.map(({ box: { xmin, ymin }, label, score }, i: number) => {
          const { color } = uniqolor(label, { lightness: 50 });
          const [x, y, w, h] = calcPosition(
            'contain',
            size.width, size.height,
            img?.width() ?? 0, img?.height() ?? 0,
            xmin, ymin
          );
          return (
            <>
              <Group
                key={`group-${i}`}
                style="stroke"
                strokeWidth={2}
                color={color}
              >
                <Rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                />
              </Group>
              <Text
                key={`text-${i}`}
                x={x > 10 ? x : x + 4}
                y={y > 10 ? y - 5 : y + 16}
                text={`${label} ${score.toFixed(2)}`}
                color={color}
                font={font}
              />
            </>
          );
        })}
      </Canvas>
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 512,
  },
});
