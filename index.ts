/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './app'; // React Native's Metro bundler handles .tsx extension automatically
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
