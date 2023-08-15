import '@flyskywhy/react-native-browser-polyfill';
import 'text-encoding-polyfill'; // support TextEncoder
import { Buffer } from 'buffer';
import XRegExp from 'xregexp';

global.Buffer = Buffer;

// replace default RegExp to support unicode
const nativeRegExp = global.RegExp;
const newRegExp = (...args) => {
  global.RegExp = nativeRegExp;
  const result = XRegExp(...args);
  global.RegExp = newRegExp;
  return result;
};
global.RegExp = newRegExp;
