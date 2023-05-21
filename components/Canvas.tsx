import React, { useImperativeHandle, useRef, useCallback } from 'react';
import { GCanvasView } from '@flyskywhy/react-native-gcanvas';

export interface CanvasProps {
  width: number | string;
  height: number | string;
}

export interface CanvasRef {
  getContext(name: string): CanvasRenderingContext2D | null;
}

export default React.forwardRef<CanvasRef, CanvasProps>((props, ref) => {
  const { width, height, ...rest } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => ({
    getContext: (name) => canvasRef.current?.getContext(name) ?? null,
    get width() {
      return canvasRef.current?.width ?? 0;
    },
    get height() {
      return canvasRef.current?.height ?? 0;
    },
  }));

  const canvasInit = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  return (
    <GCanvasView
      onCanvasCreate={canvasInit}
      isAutoClearRectBeforePutImageData={false}
      style={{ width, height }}
      {...rest}
    />
  );
});
