import React, { useState, useEffect } from 'react';
import SelectField from '../../form/SelectField';
import NumberField from '../../form/NumberField';
import BooleanField from '../../form/BooleanField';

interface Props {
  onChange: (settings: object) => void;
}

export default function Parameters(props: Props): JSX.Element {
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