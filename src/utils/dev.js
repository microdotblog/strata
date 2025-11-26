import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Require cycle:",
  "Sending `appearanceChanged` with no listeners registered",
  "Sending `onAnimatedValueUpdate` with no listeners registered",
  "RCTBridge required dispatch_sync to load RCTAccessibilityManager",
  "Support for defaultProps will be removed",
  "Open debugger"
])
