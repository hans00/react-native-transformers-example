import { RawImage } from '@xenova/transformers/src/utils/image';

export async function imageToCanvas(uri: string, scale: number = 1): HTMLCanvasElement {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      canvas.getContext('2d').drawImage(
        image,
        0, 0, image.width, image.height,
        0, 0, image.width * scale, image.height * scale
      );
      resolve(canvas);
    }
    image.onerror = reject;
    image.src = uri;
  });
}

export function createRawImage(canvas: HTMLCanvasElement): RawImage {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return new RawImage(imageData.data, canvas.width, canvas.height, 4);
}
