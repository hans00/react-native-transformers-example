import { RawImage } from '@xenova/transformers/src/utils/image';

export async function getImageData(uri: string, widthLimit: number = 0): HTMLCanvasElement {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = widthLimit ? widthLimit / image.width : 1;
      const newWidth = Math.floor(image.width * ratio);
      const newHeight = Math.floor(image.height * ratio);
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        0, 0, image.width, image.height,
        0, 0, newWidth, newHeight
      );
      resolve(ctx.getImageData(0, 0, newWidth, newHeight));
    }
    image.onerror = reject;
    image.src = uri;
  });
}

export function createRawImage(imageData: ImageData): RawImage {
  return new RawImage(imageData.data, imageData.width, imageData.height, 4);
}
