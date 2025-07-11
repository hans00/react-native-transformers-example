import { RawImage } from '@huggingface/transformers';
import { ImageData } from 'react-native-skia-offscreencanvas';

const cleanData = (data: any): any => {
  if (data instanceof RawImage) {
    return `RawImage(${data.width}x${data.height}x${data.channels}, data: ${data.data.length})`;
  } else if (data instanceof ImageData) {
    return `ImageData(${data.width}x${data.height}, data: ${data.data.length})`;
  } else if (data instanceof Float32Array) {
    return `Float32Array(${data.length})`;
  } else if (Array.isArray(data)) {
    return data.map(cleanData);
  } else if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, cleanData(value)])
    );
  }
  return data;
};

export const log = (message: string, ...args: any[]): void => {
  console.log(message, ...cleanData(args));
};

const times = new Map<string, number>();

export const time = (name: string): void => {
  times.set(name, Date.now());
};

export const timeEnd = (name: string): void => {
  const start = times.get(name);
  if (start) {
    const end = Date.now();
    const duration = end - start;
    console.log(`Time ${name}: ${duration}ms`);
  }
};
