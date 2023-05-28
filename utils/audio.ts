import wav from 'node-wav';
import AV from 'av';
import 'mp3';
import type { Buffer } from 'buffer';

const SCALING_FACTOR = Math.sqrt(2);

export interface AudioData {
  data: Float32Arrays;
  sampleRate: number;
  channels: number;
}

export const decodeBuffer = async (buf: Buffer): AudioData => {
  // WAV
  if (buf.slice(0, 4).toString() === 'RIFF') {
    const decoded = wav.decode(buf);
    const channels = decoded.channelData.length;
    const sampleLength = decoded.channelData[0].length;
    const data = new Float32Array(sampleLength * channels);
    for (let i = 0; i < sampleLength; i++) {
      for (let j = 0; j < channels; j++) {
        data[i * channels + j] = decoded.channelData[j][i];
      }
    }
    return {
      data,
      sampleRate: decoded.sampleRate,
      channels,
    };
  }
  // MP3
  if (buf.slice(0, 3).toString() === 'ID3') {
    const mp3 = AV.Asset.fromBuffer(buf);
    const decoded = new Promise((resolve) => mp3.decodeToBuffer(resolve));
    return {
      data: await decoded,
      sampleRate: mp3.format.sampleRate,
      channels: mp3.format.channelsPerFrame,
    }
  }
  throw new Error('Unsupported Audio Format');
}

export const toSingleChannel = (audio: AudioData): AudioData => {
  if (audio.channels === 1) return audio;
  const data = new Float32Array(audio.data.length / audio.channels);
  for (let i = 0; i < data.length; i++) {
    data[i] = audio.data
      .slice(i * audio.channels, (i + 1) * audio.channels)
      .reduce((a, b) => a + b, 0) * SCALING_FACTOR / audio.channels;
  }
  return {
    data,
    sampleRate: audio.sampleRate,
    channels: 1,
  };
}

export const downsample = (audio: AudioData, toSampleRate: number): AudioData => {
  if (audio.sampleRate === toSampleRate) return audio;
  const compression = audio.sampleRate / toSampleRate;
  const length = audio.data.length / compression;
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = audio.data[Math.round(i * compression)];
  }
  return {
    data: result,
    sampleRate: toSampleRate,
    channels: audio.channels,
  };
}

export const toFloatArray = (arr: Float32Arrays|Int16Array|Uint8Array): Float32Array => {
  if (arr instanceof Float32Array) {
    return arr;
  } else if (arr instanceof Int16Array) {
    return new Float32Array(arr.map(v => v / 32768));
  } else if (arr instanceof Uint8Array) {
    return new Float32Array(arr.map(v => (v - 128) / 128));
  } else {
    throw new Error('Unsupported Array Type');
  }
}
