import { RawImage } from '@huggingface/transformers';

export async function getImageData(uri: string, maxSize: number = 512): global.Image {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = Math.max(image.width, image.height);
      const scale = size > maxSize ? maxSize / size : 1;
      const newWidth = Math.round(image.width * scale);
      const newHeight = Math.round(image.height * scale);
      const canvas = new OffscreenCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      resolve(ctx.getImageData(0, 0, newWidth, newHeight));
      canvas.surface?.destroy();
    };
    image.onerror = reject;
    image.src = uri;
  });
}

export function createRawImage(imageData: ImageData): RawImage {
  return new RawImage(imageData.data, imageData.width, imageData.height, 4);
}

export function calcPosition(
  mode: 'contain'|'cover',
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  x: number,
  y: number
): [number, number, number, number] {
  const w = Math.min(containerWidth, imageWidth);
  const h = Math.min(containerHeight, imageHeight);
  const ratio = mode === 'contain' ? Math.min(w / imageWidth, h / imageHeight) : Math.max(w / imageWidth, h / imageHeight);
  const offsetX = (containerWidth - imageWidth * ratio) / 2;
  const offsetY = (containerHeight - imageHeight * ratio) / 2;
  const newWidth = imageWidth * ratio;
  const newHeight = imageHeight * ratio;
  const newX = (containerWidth - newWidth) * x + offsetX;
  const newY = (containerHeight - newHeight) * y + offsetY;
  return [newX, newY, newWidth, newHeight];
}
