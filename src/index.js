import {AppRegistry} from 'react-native';
import MainApp from './screens/App';
import {name as appName} from './../app.json';
import './utils/snapshots';

AppRegistry.registerComponent(appName, () => MainApp);