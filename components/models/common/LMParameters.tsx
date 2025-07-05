import React, { useState, useEffect } from 'react';
import NumberField from '../../form/NumberField';
import BooleanField from '../../form/BooleanField';
import type { Settings } from './types';

interface Props {
  onChange: (settings: Settings) => void;
}

export default function Parameters(props: Props): React.JSX.Element {
  const { onChange } = props;
  const [params, setParams] = useState<Settings>({
    max_new_tokens: 50,
    num_beams: 1,
    temperature: 1,
    top_k: 0,
    do_sample: false,
  });

  useEffect(() => {
    onChange(params);
  }, [params, onChange]);

  return (
    <>
      <NumberField
        title="Max length"
        value={params.max_new_tokens as number}
        onChange={(value) => setParams({ ...params, max_new_tokens: value })}
      />
      <NumberField
        title="Beams"
        value={params.num_beams as number}
        onChange={(value) => setParams({ ...params, num_beams: value })}
        isInteger
      />
      <NumberField
        title="Temperature"
        value={params.temperature as number}
        onChange={(value) => setParams({ ...params, temperature: value })}
      />
      <NumberField
        title="Top K"
        value={params.top_k as number}
        onChange={(value) => setParams({ ...params, top_k: value })}
        isInteger
      />
      <BooleanField
        title="Sample"
        value={params.do_sample as boolean}
        onChange={(value) => setParams({ ...params, do_sample: value })}
      />
    </>
  );
}
