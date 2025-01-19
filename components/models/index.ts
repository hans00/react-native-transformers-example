import * as Translation from './Translation';
import * as TextGeneration from './TextGeneration';
import * as FillMask from './FillMask';
import * as TextClassification from './TextClassification';
import * as TokenClassification from './TokenClassification';
import * as ZeroShotClassification from './ZeroShotClassification';
import * as QuestionAnswering from './QuestionAnswering';
import * as Summarization from './Summarization';
import * as ASR from './ASR';
import * as ImageToText from './ImageToText';
import * as ImageClassification from './ImageClassification';
import * as ZeroShotImageClassification from './ZeroShotImageClassification';
import * as ImageSegmentation from './ImageSegmentation';
import * as ObjectDetection from './ObjectDetection';
import * as TTS from './TTS';

export default {
  'translation': Translation,
  'text-generation': TextGeneration,
  'fill-mask': FillMask,
  'text-classification': TextClassification,
  'token-classification': TokenClassification,
  'zero-shot-classification': ZeroShotClassification,
  'question-answering': QuestionAnswering,
  'summarization': Summarization,
  'automatic-speech-recognition': ASR,
  'image-to-text': ImageToText,
  'image-classification': ImageClassification,
  'zero-shot-image-classification': ZeroShotImageClassification,
  'image-segmentation': ImageSegmentation,
  'object-detection': ObjectDetection,
  'text-to-speech': TTS,
}
