import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const useColor = (mode: 'foreground' | 'background') => {
  const isDarkMode = useColorScheme() === 'dark';

  if (mode === 'foreground') {
    return isDarkMode ? '#fff' : '#000';
  }
  return isDarkMode ? Colors.darker : Colors.lighter;
}
