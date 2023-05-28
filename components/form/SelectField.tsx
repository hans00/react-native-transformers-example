import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { useColor } from '../../utils/style';

interface Props {
  title?: string;
  options: string[];
  optionLabels?: string[];
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  width: number|string;
}

export default function SelectField(props: Props): JSX.Element {
  const { title, options, onChange, value, placeholder, optionLabels, width } = props;
  const ref = useRef(null);

  const color = useColor('foreground');
  const textColor = { color };

  useEffect(() => {
    if (value)
      ref.current?.selectIndex(options.indexOf(value));
  }, [options, value]);

  return (
    <View>
      {title && <Text style={[styles.title, textColor]}>{title}</Text>}
      <SelectDropdown
        ref={ref}
        data={options}
        onSelect={onChange}
        defaultButtonText={placeholder}
        buttonTextAfterSelection={(item, i) => optionLabels?.[i] ?? item}
        rowTextForSelection={(item, i) => optionLabels?.[i] ?? item}
        buttonStyle={[styles.button, width && { width }]}
      />
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
  },
});
