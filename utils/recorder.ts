import AudioStream from '@fugood/react-native-audio-pcm-stream';
import { Buffer } from 'buffer';
import { AudioData, toFloatArray } from './audio';

const decodeS16LE = (buffer) =>
  Array.from(
    { length: buffer.length / 2 },
    (v, i) => buffer.readInt16LE(i * 2),
  )

export default class AudioRecorder {
  private sampleRate: number;
  private bitDepth: number;
  private channels: number;
  private bufferSize: number;
  private samples: Buffer;
  private listener: any;

  constructor({
    sampleRate = 16000,
    bitDepth = 16,
    channels = 1,
    bufferSize = 4096,
  } = {}) {
    this.sampleRate = sampleRate
    this.bitDepth = bitDepth
    this.channels = channels
    this.bufferSize = bufferSize
    this.samples = Buffer.alloc(0);
    this.listener = null;
  }

  async start() {
    await AudioStream.init({
      bufferSize: this.bufferSize,
      sampleRate: this.sampleRate,
      bitsPerSample: this.bitDepth,
      channels: this.channels,
    });
    this.listener = AudioStream.on('data', (data: string) => {
      this.samples = Buffer.concat([this.samples, Buffer.from(data, 'base64')]);
    });
    await AudioStream.start();
  }

  async stop(): Promise<AudioData> {
    await AudioStream.stop();
    this.listener?.remove();
    let data: Uint8Array | Int16Array;
    if (this.bitDepth === 16) {
      data = new Int16Array(this.samples.buffer);
    } else {
      data = new Uint8Array(this.samples.buffer);
    }
    return {
      data: toFloatArray(data),
      sampleRate: this.sampleRate,
      channels: this.channels,
    };
  }
}
