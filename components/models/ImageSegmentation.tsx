import React, { useState, useEffect, useCallback, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { StyleSheet } from 'react-native';
import { GCanvasView } from '@flyskywhy/react-native-gcanvas';
import { RawImage } from '@xenova/transformers/src/utils/image';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';
import Canvas from '../Canvas';
import { getImageData, createRawImage } from '../../utils/image';

export const title = 'Image Segmentation';

export { default as Settings } from './common/Empty';

export { default as Parameters } from './common/Empty';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

interface Segment {
  label: string;
  score: number;
  mask: RawImage;
}

const randomNum = () => Math.floor(Math.random() * 155 + 100);

export function Interact({ runPipe }: InteractProps): JSX.Element {
  const [results, setResults] = useState<Segment[]>([]);
  const [isWIP, setWIP] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const inferImg = useRef<HTMLCanvasElement|null>(null);

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      inferImg.current = await getImageData(input, canvasRef.current.width);
      const predicts = await runPipe('image-segmentation', createRawImage(inferImg.current));
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && inferImg.current) {
      const width = inferImg.current.width;
      const height = inferImg.current.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(inferImg.current, 0, 0);
      results.reduce((p, { label, mask, score }, index) => p.then(async () => {
        // mask data to RGBA
        const dataRGBA = new Uint8ClampedArray(width * height * 4);
        const red = randomNum();
        const green = randomNum();
        const blue = randomNum();
        for (let i = 0; i < dataRGBA.length; i += 4) {
          const maskIndex = Math.floor(i / 4);
          dataRGBA[i] = red;
          dataRGBA[i + 1] = green;
          dataRGBA[i + 2] = blue;
          dataRGBA[i + 3] = mask.data[maskIndex] * 0.6;
        }
        ctx.putImageData(new ImageData(dataRGBA, width, height), 0, 0);
        ctx.font = '20px serif';
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 1)`;
        ctx.fillText(
          `${label} (${score.toFixed(2)})`,
          0,
          height + 20 * (index + 1),
        );
      }), Promise.resolve());
    }
  }, [results]);

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
        ref={canvasRef}
        isGestureResponsible={false}
        width="100%"
        height={640}
      />
    </>
  )
}
