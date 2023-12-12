import {AppRegistry} from 'react-native';
import MainApp from './screens/App';
import {name as appName} from './../app.json';
import './utils/snapshots';
import './utils/string_checker';

AppRegistry.registerComponent(appName, () => MainApp);