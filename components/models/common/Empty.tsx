import React from 'react';
import { Text } from 'react-native';
import { useColor } from '../../../utils/style';

export default function Settings(props: Props): JSX.Element {
  const color = useColor('foreground');
  const textColor = { color };
  return (
    <>
      <Text style={textColor}>Nothing</Text>
    </>
  )
}
