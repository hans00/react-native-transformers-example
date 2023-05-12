import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

interface Props {
  title?: string;
  value?: boolean;
  onChange: (value: boolean) => void;
}

export default function BooleanField(props: Props): JSX.Element {
  const { title, onChange, value } = props;

  const handlePress = useCallback(() => {
    onChange(!value);
  }, [onChange, value]);

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? 'rgb(210, 230, 255)'
              : 'white'
          },
          styles.button,
        ]}
      >
        <Text style={styles.text}>
          {value ? 'ON' : 'OFF'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
