import React, { useState, useCallback } from 'react';
import TextField from '../form/TextField';
import Button from '../form/Button';
import type { InteractProps } from './common/types';

export const title = 'Question Answering';

export { default as Settings } from './common/Settings';

export { default as Parameters } from './common/Empty';

const sampleCtx = 'The Amazon rainforest (Portuguese: Floresta Amazônica or Amazônia; Spanish: Selva Amazónica, Amazonía or usually Amazonia; French: Forêt amazonienne; Dutch: Amazoneregenwoud), also known in English as Amazonia or the Amazon Jungle, is a moist broadleaf forest that covers most of the Amazon basin of South America. This basin encompasses 7,000,000 square kilometres (2,700,000 sq mi), of which 5,500,000 square kilometres (2,100,000 sq mi) are covered by the rainforest. This region includes territory belonging to nine nations. The majority of the forest is contained within Brazil, with 60% of the rainforest, followed by Peru with 13%, Colombia with 10%, and with minor amounts in Venezuela, Ecuador, Bolivia, Guyana, Suriname and French Guiana. States or departments in four nations contain "Amazonas" in their names. The Amazon represents over half of the planet\'s remaining rainforests, and comprises the largest and most biodiverse tract of tropical rainforest in the world, with an estimated 390 billion individual trees divided into 16,000 species.';
const sampleQuestion = 'What proportion of the planet\'s rainforests are found in the Amazon?';

export function Interact({ settings: { model }, runPipe }: InteractProps): JSX.Element {
  const [context, setContext] = useState<string>(sampleCtx);
  const [question, setQuestion] = useState<string>(sampleQuestion);
  const [answer, setAnswer] = useState<string>('');
  const [isWIP, setWIP] = useState<boolean>(false);

  const call = useCallback(async () => {
    setWIP(true);
    try {
      const { answer } = await runPipe('question-answering', model, null, question, context);
      setAnswer(answer);
    } catch {}
    setWIP(false);
  }, [model, question, context, runPipe]);

  return (
    <>
      <TextField
        title="Context"
        value={context}
        onChange={setContext}
        multiline
      />
      <TextField
        title="Question"
        value={question}
        onChange={setQuestion}
        multiline
      />
      <Button
        title="Predict"
        onPress={call}
        disabled={isWIP}
      />
      <TextField
        title="Answer"
        value={answer}
        multiline
        disabled
      />
    </>
  );
}
