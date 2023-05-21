import '@flyskywhy/react-native-browser-polyfill';
import 'text-encoding-polyfill';
import { Buffer } from 'buffer';
import XRegExp from 'xregexp';

global.Buffer = Buffer;

const nativeRegExp = global.RegExp;
const newRegExp = (...args) => {
  global.RegExp = nativeRegExp;
  const result = XRegExp(...args);
  global.RegExp = newRegExp;
  return result;
};
global.RegExp = newRegExp;
