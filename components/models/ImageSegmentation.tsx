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
import { imageToCanvas, createRawImage } from '../../utils/image';

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
      inferImg.current = await imageToCanvas(input, 512);
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
      const canvasWidth = canvasRef.current.width;
      const ratio = width / canvasWidth;
      const targetHeight = Math.floor(height / ratio);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        inferImg.current,
        0, 0, width, height,
        0, 0, canvasWidth, targetHeight,
      );
      results.reduce((p, { label, mask, score }, index) => p.then(async () => {
        const scaledMask = await mask.resize(canvasWidth, targetHeight);
        // mask data to RGBA
        const dataRGBA = new Uint8ClampedArray(canvasWidth * targetHeight * 4);
        const red = randomNum();
        const green = randomNum();
        const blue = randomNum();
        for (let i = 0; i < canvasWidth * targetHeight; i++) {
          const j = i * 4;
          dataRGBA[j] = red;
          dataRGBA[j + 1] = green;
          dataRGBA[j + 2] = blue;
          dataRGBA[j + 3] = scaledMask.data[i] * 0.6;
        }
        ctx.putImageData(new ImageData(dataRGBA, canvasWidth, targetHeight), 0, 0);
        ctx.font = '20px serif';
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 1)`;
        ctx.fillText(
          `${label} (${score.toFixed(2)})`,
          0,
          targetHeight + 20 * (index + 1),
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
