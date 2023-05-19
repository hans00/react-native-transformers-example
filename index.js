/**
 * @format
 */
import '@flyskywhy/react-native-browser-polyfill';
import 'text-encoding-polyfill';
import { Buffer } from 'buffer';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

global.Buffer = Buffer;

AppRegistry.registerComponent(appName, () => App);
