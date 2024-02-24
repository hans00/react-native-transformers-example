import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import sha from 'sha.js';

export const getFile = async (url: string): string => {
  const filename = sha('sha256').update(url).digest('hex');
  const path = `${RNFS.CachesDirectoryPath}/${filename}.wav`;

  if (!await RNFS.exists(path)) {
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: path,
    }).promise;
  }

  return path;
}
