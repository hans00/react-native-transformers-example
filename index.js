/**
 * @format
 */
import {AppRegistry} from 'react-native';
import './polyfills';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
