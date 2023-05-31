import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import { useColor } from '../../utils/style';

interface Props {
  title?: string;
  placeholder?: string;
  value?: number;
  isInteger?: boolean;
  onChange?: (value: number) => void;
  editable?: boolean;
}

export default function NumberField(props: Props): JSX.Element {
  const { title, onChange, placeholder, value, isInteger, editable } = props;

  const color = useColor('foreground');
  const textColor = { color };

  const handleChange = useCallback((val) => {
    const num = Number(val)
    if (!Number.isNaN(num) && (!isInteger || Number.isInteger(num))) {
      onChange?.(num);
    } else {
      onChange?.(0);
    }
  }, [onChange])

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, textColor]}>{title}</Text>}
      <TextInput
        style={[styles.input, textColor]}
        onChangeText={handleChange}
        value={value ? String(value) : '0'}
        placeholder={placeholder}
        keyboardType="numeric"
        editable={editable}
      />
    </View>
  )
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
});
