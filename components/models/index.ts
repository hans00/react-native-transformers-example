import * as Translation from './Translation';
import * as TextGeneration from './TextGeneration';
import * as ASR from './ASR';

// const tasks = [
//   'translation',
//   'text-generation',
//   'masked-language-modelling',
//   'sequence-classification',
//   'token-classification',
//   'zero-shot-classification',
//   'question-answering',
//   'summarization',
//   'code-completion',
//   'automatic-speech-recognition',
//   'image-to-text',
//   'image-classification',
//   'zero-shot-image-classification',
//   'object-detection',
// ];

export default {
	'translation': Translation,
	'text-generation': TextGeneration,
	'automatic-speech-recognition': ASR,
}
