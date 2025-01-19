import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Modal,
} from 'react-native';
import type { TextStyle } from 'react-native';
import { useColor } from '../../utils/style';

export type Option = { value: any; label: string };

interface Props {
  title?: string;
  options: Array<Option | string>;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  inline?: boolean;
}

interface DropdownProps {
  data: Option[];
  onSelect: (value: any) => void;
  value: any;
  placeholder: string;
}

const Dropdown = ({ data, onSelect, value, placeholder }: DropdownProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = data.findIndex(item => item.value === value);
  const showTitle = data[selectedIndex]?.label ?? placeholder;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState(0);

  const handlePress = useCallback((index: number) => {
    onSelect(data[index].value);
    setIsOpen(false);
  }, [onSelect, data]);

  return (
    <>
      <Pressable onPress={() => setIsOpen(!isOpen)}>
        <Text>{showTitle} {isOpen ? '▲' : '▼'}</Text>
      </Pressable>
      <Modal 
        animationType="fade"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              data={data}
              onLayout={({ nativeEvent }) => setListHeight(Math.min(nativeEvent.layout.height, 300))}
              renderItem={({ item, index }) => (
                <Pressable
                onPress={() => handlePress(index)}
                onHoverIn={() => setHoveredIndex(index)}
                onHoverOut={() => setHoveredIndex(null)}>
                  <Text
                      style={[
                        styles.row,
                        index % 2 === 0 ? styles.evenRow : styles.oddRow,
                        hoveredIndex === index && styles.hoveredRow,
                        index === selectedIndex && styles.selectedRow
                    ]}>{item.label}</Text>
                </Pressable>
              )}
              keyExtractor={(item) => item.value.toString()}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function SelectField(props: Props): React.JSX.Element {
  const { title, options, onChange, value, placeholder, inline } = props;

  const data = useMemo(() => {
    return options.map((option) => typeof option === 'string' ? { value: option, label: option } : option);
  }, [options]);

  const color = useColor('foreground');
  const textColor = { color };

  return (
    <View style={[inline && styles.inline, styles.container]}>
      {title && <Text style={[styles.title, textColor, inline && styles.titleInline]}>{title}</Text>}
      <Dropdown
        data={data}
        onSelect={(item) => onChange?.(item)}
        value={value}
        placeholder={placeholder ?? 'Select an option'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  inline: {
    flexDirection:'row',
    flexWrap:'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleInline: {
    marginRight: 8,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    padding: 10,
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  oddRow: {
    backgroundColor: '#f0f0f0',
  },
  hoveredRow: {
    backgroundColor: '#eee',
  },
  selectedRow: {
    backgroundColor: '#ddd',
  },
});
