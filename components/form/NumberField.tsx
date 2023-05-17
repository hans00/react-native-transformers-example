import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';

interface Props {
  title?: string;
  placeholder?: string;
  value?: number;
  isInteger?: boolean;
  onChange: (value: number) => void;
  editable?: boolean;
}

export default function NumberField(props: Props): JSX.Element {
  const { title, onChange, placeholder, value, isInteger, editable } = props;

  const handleChange = useCallback(() => {
    const num = Number(value)
    if (!Number.isNaN(num) && (!isInteger || Number.isInteger(num))) {
      onChange(num);
    } else {
      onChange(0);
    }
  }, [onChange])

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },
});