import { useState, useCallback } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';

export const usePhoto = (onUpdate?: (string)=>any) => {
  const handleResponse = useCallback((res) => {
    if (res.assets?.length) {
      const [asset] = res.assets;
      if (asset.width && asset.height) {
        onUpdate?.(asset.uri);
      }
    } else if (res.errorCode) {
      Alert.alert('Error', res.errorMessage ?? `code: ${res.errorCode}`);
    } else if (!res.didCancel) {
      Alert.alert('Error', 'Seems you selected unsupported image');
    }
  }, []);

  const selectPhoto = useCallback(() => {
    launchImageLibrary({ mediaType: 'photo' }).then(handleResponse);
  }, [handleResponse]);

  const takePhoto = useCallback(() => {
    launchCamera({ mediaType: 'photo' }).then(handleResponse);
  }, [handleResponse]);

  return { selectPhoto, takePhoto };
}
