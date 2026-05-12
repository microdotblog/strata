import { Platform } from 'react-native';

export const isAndroidStatusBarSupported = (platform = Platform.OS) =>
  platform === 'android';

export const statusBarStyleForTheme = theme =>
  theme === 'dark' ? 'light-content' : 'dark-content';

export const nativeStackStatusBarStyleForTheme = theme =>
  theme === 'dark' ? 'light' : 'dark';

export const nativeStackStatusBarOptions = (
  theme,
  backgroundColor,
  platform = Platform.OS,
) => {
  if (!isAndroidStatusBarSupported(platform)) {
    return {};
  }

  return {
    statusBarBackgroundColor: backgroundColor,
    statusBarStyle: nativeStackStatusBarStyleForTheme(theme),
  };
};
