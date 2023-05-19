import type {PropsWithChildren, Props} from 'react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColor } from '../utils/style';

type ProgressProps = Props<{
  title: string;
  value?: number;
  status?: 'initiate' | 'download' | 'done';
}>;

export default function Progress(props: ProgressProps): JSX.Element {
  const { value, title, status } = props;
  const width = (value ?? (status === 'done' ? 1 : 0)) * 100;

  const color = useColor('foreground');
  const textColor = { color };

  return (
    <View style={styles.progress}>
      <Text style={[styles.progressTitle, textColor]}>{title}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressValue, { width: `${width}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressValue: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});
