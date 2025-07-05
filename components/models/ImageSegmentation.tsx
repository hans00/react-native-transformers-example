import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Skia,
  Canvas,
  Image,
  useImage,
  Group,
  Mask,
  Fill,
  ColorType,
  AlphaType,
  SkImage,
} from '@shopify/react-native-skia';
import uniqolor from 'uniqolor';
import parseColor from 'color-parse';
import Button from '../form/Button';
import { getImageData, createRawImage } from '../../utils/image';
import { usePhoto } from '../../utils/photo';
import type { InteractProps } from './common/types';
import type { ImageSegmentationPipelineOutput } from '@huggingface/transformers';

export const title = 'Image Segmentation';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

export function Interact({ settings: { model }, runPipe }: InteractProps): React.JSX.Element {
  const [results, setResults] = useState<ImageSegmentationPipelineOutput[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);
  const [inputImage, setInputImage] = useState<string>('');
  const img = useImage(inputImage);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const call = useCallback(async (input: string) => {
    setWIP(true);
    try {
      setInputImage(input);
      const data = await getImageData(input);
      const predicts = await runPipe('image-segmentation', model, null, createRawImage(data));
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, [model, runPipe]);

  const masks = useRef<SkImage[]>([]);
  useEffect(() => {
    if (results?.length) {
      masks.current = results.map(({ mask }) => {
        const data = Skia.Data.fromBytes(mask.data as Uint8Array);
        const image = Skia.Image.MakeImage({
          width: mask.width,
          height: mask.height,
          colorType: ColorType.Gray_8,
          alphaType: AlphaType.Unpremul,
        }, data, mask.width);
        data.dispose();
        return image as SkImage;
      });
    }
    return () => masks.current.forEach((mask) => mask.dispose());
  }, [results]);

  const colors = useMemo(() => results?.map(({ label }) => {
    const lightness = label?.startsWith('LABEL_') ? 40 : 80;
    const { color } = uniqolor(label ?? '', { lightness });
    const { values } = parseColor(color);
    return { text: color, mask: `rgba(${values.join(', ')}, 0.8)` };
  }), [results]);

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
        {results?.map((result, i) => (
          <Group key={`mask-${i}`}>
            <Mask
              mode="luminance"
              mask={(
                <Image
                  image={masks.current[i]}
                  fit="contain"
                  x={0}
                  y={0}
                  width={size.width}
                  height={size.height}
                />
              )}
            >
              <Fill color={colors?.[i]?.mask} />
            </Mask>
          </Group>
        ))}
      </Canvas>
      {results?.map(({ label, score }, i) => (
        <Text
          key={`text-${i}`}
          style={[{ color: colors?.[i]?.text }, styles.text]}
        >
          {`${label} (${score?.toFixed(2) ?? ''})`}
        </Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: 512,
  },
  text: {
    fontSize: 14,
  },
});
