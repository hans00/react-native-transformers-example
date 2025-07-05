import React, { useState, useEffect, useCallback } from 'react';
import SelectField from '../form/SelectField';
import TextField from '../form/TextField';
import Button from '../form/Button';
import type { InteractProps, Settings } from './common/types';

export const title = 'Translation';

interface Props {
  onChange: (settings: Settings) => void;
}

export function Settings(props: Props): React.JSX.Element {
  const { onChange } = props;
  const [languageFrom, setFrom] = useState<string>('en');
  const [languageTo, setTo] = useState<string>('fr');

  useEffect(() => {
    onChange({ languageFrom, languageTo });
  }, [languageFrom, languageTo, onChange]);

  return (
    <>
      <SelectField
        title="Translate from"
        options={['en']}
        value={languageFrom}
        onChange={setFrom}
        inline
      />
      <SelectField
        title="to"
        options={['fr', 'de', 'ro']}
        value={languageTo}
        onChange={setTo}
        inline
      />
    </>
  );
}

export { default as Parameters } from './common/LMParameters';

export function Interact({ settings, params, runPipe }: InteractProps): React.JSX.Element {
  const [input, setInput] = useState<string>('Hello, how are you?');
  const [output, setOutput] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const [{ translation_text: text }] = await runPipe(
        `translation_${settings.languageFrom}_to_${settings.languageTo}`,
        null,
        null,
        [input],
        params
      );
      setOutput(text);
    } catch {}
    setWIP(false);
  }, [input, settings, params, runPipe]);

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
  );
}
