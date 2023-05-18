import React, { useState, useEffect, useCallback } from 'react';
import SelectField from './form/SelectField';
import TextField from './form/TextField';
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

export { default as Parameters } from './LMParameters';

interface InteractProps {
  settings: object;
  params: object;
  runPipe: (args: any) => Promise<any>;
}

export function Interact({ settings, params, runPipe }: InteractProps): JSX.Element {
  const [input, setInput] = useState<string>('Hello, how are you?');
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ translation_text: text }] = await runPipe(
        `translation_${settings.languageFrom}_to_${settings.languageTo}`,
        [input],
        params
      );
      setOutput(text);
    } catch {}
    setWIP(false);
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
        disabled={isWIP}
      />
    </>
  )
}
