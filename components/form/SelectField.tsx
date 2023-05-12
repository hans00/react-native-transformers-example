import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

interface Props {
  title?: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}

export default function SelectField(props: Props): JSX.Element {
  const { title, options, onChange, value, placeholder } = props;
  const ref = useRef(null);

  useEffect(() => {
    if (value)
      ref.current?.selectIndex(options.indexOf(value));
  }, [options, value]);

  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <SelectDropdown
        ref={ref}
        data={options}
        onSelect={onChange}
        buttonTextAfterSelection={(selectedItem) => selectedItem}
        rowTextForSelection={(item) => item}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
