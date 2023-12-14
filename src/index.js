import { AppRegistry } from 'react-native';
import MainApp from './screens/App';
import { name as appName } from './../app.json';
import './utils/snapshots';
import './utils/string_checker';
import './utils/dev';

AppRegistry.registerComponent(appName, () => MainApp);