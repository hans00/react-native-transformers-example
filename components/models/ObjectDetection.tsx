import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import uniqolor from 'uniqolor';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import Progress from '../Progress';
import Canvas from '../Canvas';
import { getImageData, createRawImage } from '../../utils/image';
import { usePhoto } from '../../utils/photo';

export const title = 'Object Detection';

export { default as Settings } from './common/Empty';

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

export function Interact({ runPipe }: InteractProps): JSX.Element {
  const [results, setResults] = useState<Result[]>(null);
  const [isWIP, setWIP] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const inferImg = useRef<any>(null);

  const call = useCallback(async (input) => {
    setWIP(true);
    try {
      inferImg.current = await getImageData(input, canvasRef.current.width);
      const predicts = await runPipe('object-detection', createRawImage(inferImg.current));
      setResults(predicts);
    } catch {}
    setWIP(false);
  }, []);

  const { selectPhoto, takePhoto } = usePhoto((uri) => call(uri));

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && inferImg.current && results) {
      const width = inferImg.current.width;
      const height = inferImg.current.height;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.putImageData(inferImg.current, 0, 0);
      ctx.fillStyle = '#FFFFFF'; // Avoid weired bug
      results.forEach(({ box: { xmin, ymin, xmax, ymax}, label, score }, i) => {
        const color = uniqolor(label, { lightness: 50 }).color;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.rect(
          xmin,
          ymin,
          (xmax - xmin),
          (ymax - ymin),
        );
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.fillStyle = color;
        ctx.fillText(
          `${label} ${score.toFixed(2)}`,
          ymin > 10 ? xmin : xmin + 4,
          ymin > 10 ? ymin - 5 : ymin + 16,
        );
      });
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
        height={512}
      />
    </>
  )
}

const styles = StyleSheet.create({
  gcanvas: {
    width: '100%',
    height: 512,
  },
});
