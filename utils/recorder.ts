import AudioStream from '@fugood/react-native-audio-pcm-stream';
import { Buffer } from 'buffer';

const decodeS16LE = (buffer) =>
  Array.from(
    { length: buffer.length / 2 },
    (v, i) => buffer.readInt16LE(i * 2),
  )

export default class AudioRecorder {
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
    this.samples = [];
    this.listener = null;
  }

  async start() {
    await AudioStream.init({
      bufferSize: this.bufferSize,
      sampleRate: this.sampleRate,
      bitsPerSample: this.bitDepth,
      channels: this.channels,
    });
    this.listener = AudioStream.on('data', (data) => {
      const sample = decodeS16LE(Buffer.from(data, 'base64'))
        .map(v => v / 32768)
      this.samples = this.samples.concat(sample);
    });
    await AudioStream.start();
  }

  async stop() {
    await AudioStream.stop();
    this.listener?.remove();
    return this.samples;
  }
}
