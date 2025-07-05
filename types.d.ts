// react-native-skia-offscreencanvas
declare module 'react-native-skia-offscreencanvas' {
  export class Image {
    constructor(width?: number, height?: number);
    onload: () => void;
    onerror: () => void;
    src: string;
    width: number;
    height: number;
  }

  export class ImageData {
    constructor(width: number, height: number, data: Uint8Array);
    data: Uint8Array;
    width: number;
    height: number;
  }

  export class OffscreenCanvas {
    constructor(width: number, height: number);
    getContext(ctx: string): CanvasRenderingContext2D;
    surface: {
      destroy: () => void;
    };
  }

  export class CanvasRenderingContext2D {
    constructor(canvas: OffscreenCanvas);
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    drawImage(image: Image, x: number, y: number, width: number, height: number): void;
  }
}

// node-wav
declare module 'node-wav' {
  export function decode(buffer: Buffer): {
    channelData: Float32Array[];
    sampleRate: number;
  };
  export function encode(channelData: Float32Array[], options: {
    sampleRate: number;
    float: boolean;
  }): Buffer;
}

// @fugood/react-native-audio-pcm-stream
declare module '@fugood/react-native-audio-pcm-stream' {
  export default class AudioStream {
    static init: (options: {
      bufferSize: number;
      sampleRate: number;
      bitsPerSample: number;
      channels: number;
    }) => Promise<void>;
    static start: () => Promise<void>;
    static stop: () => Promise<void>;
    static on: (event: string, callback: (data: string) => void) => void;
  }
}

// av module
declare module 'av' {
  interface Asset {
    fromBuffer(buffer: Buffer): any;
  }

  interface DefaultExport {
    Asset: Asset;
  }

  const defaultExport: DefaultExport;
  export default defaultExport;
}
