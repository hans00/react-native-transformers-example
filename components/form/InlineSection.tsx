import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColor } from '../../utils/style';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

export default function InlineSection({children, title}: SectionProps): JSX.Element {
  const color = useColor('foreground');
  const textColor = { color };

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, textColor]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionContent: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});