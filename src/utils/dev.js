import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Require cycle:",
  "Sending `appearanceChanged` with no listeners registered",// Seems to be new in 17.2
  "Sending `onAnimatedValueUpdate` with no listeners registered"
])
