import {Platform} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';

const ANDROID_LIST_BOTTOM_PADDING = 45;
const IOS_TAB_BAR_HEIGHT = 49;
const IOS_FLOATING_TAB_BAR_OFFSET = 20;

export function tabListBottomPadding() {
  if (Platform.OS !== 'ios') {
    return ANDROID_LIST_BOTTOM_PADDING;
  }

  const bottomInset = initialWindowMetrics?.insets.bottom ?? 0;
  return bottomInset + IOS_TAB_BAR_HEIGHT + IOS_FLOATING_TAB_BAR_OFFSET;
}
