import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useColor } from '../../utils/style';

interface Props {
  title?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export default function BooleanField(props: Props): JSX.Element {
  const { title, onChange, value } = props;

  const color = useColor('foreground');
  const textColor = { color };

  const handlePress = useCallback(() => {
    onChange?.(!value);
  }, [onChange, value]);

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, textColor]}>{title}</Text>}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? 'rgb(210, 230, 255)'
              : 'white',
          },
          styles.button,
        ]}
      >
        <Text style={styles.text}>
          {value ? 'ON' : 'OFF'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  button: {
    borderRadius: 8,
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});
