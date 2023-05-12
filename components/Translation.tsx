import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SelectField from './form/SelectField';
import TextField from './form/TextField';
import NumberField from './form/NumberField';
import BooleanField from './form/BooleanField';
import Button from './form/Button';

interface Props {
  onChange: (settings: object) => void;
}

const translateFrom = ['en'];
const translateTo = ['fr', 'de', 'ro'];

export function Settings(props: Props): JSX.Element {
  const { onChange } = props;
  const [languageFrom, setFrom] = useState<string>('en');
  const [languageTo, setTo] = useState<string>('fr');

  useEffect(() => {
    onChange({ languageFrom, languageTo })
  }, [languageFrom, languageTo])

  return (
    <>
      <SelectField
        title="Translate from"
        options={['en']}
        value={languageFrom}
        onChange={setFrom}
      />
      <SelectField
        title="to"
        options={['fr', 'de', 'ro']}
        value={languageTo}
        onChange={setTo}
      />
    </>
  )
}

export function Parameters(props: Props): JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<object>({
    max_new_tokens: 50,
    num_beams: 1,
    temperature: 1,
    top_k: 0,
    do_sample: false,
  });

  useEffect(() => {
    onChange(params)
  }, [params])

  return (
    <>
      <NumberField
        title="Max length"
        value={params.max_new_tokens}
        onChange={(value) => setParams({ ...params, max_new_tokens: value })}
      />
      <NumberField
        title="Beams"
        value={params.num_beams}
        onChange={(value) => setParams({ ...params, num_beams: value })}
        isInteger
      />
      <NumberField
        title="Temperature"
        value={params.temperature}
        onChange={(value) => setParams({ ...params, temperature: value })}
      />
      <NumberField
        title="Top K"
        value={params.top_k}
        onChange={(value) => setParams({ ...params, top_k: value })}
        isInteger
      />
      <BooleanField
        title="Sample"
        value={params.do_sample}
        onChange={(value) => setParams({ ...params, do_sample: value })}
      />
    </>
  )
}

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ settings, params, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>('Hello, how are you?');
  const [output, setOutput] = useState<string>('');

  const call = useCallback(async () => {
    const result = await runPipe([input, {...settings, ...params}]);
    setOutput(result);
  }, [input, settings, params]);

  return (
    <>
      <TextField
        title="Input"
        value={input}
        onChange={setInput}
        multiline
      />
      <TextField
        title="Output"
        value={output}
        editable={false}
        multiline
      />
      <Button
        title="Generate"
        onPress={call}
      />
    </>
  )
}
