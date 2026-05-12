export const statusBarStyleForTheme = theme =>
  theme === 'dark' ? 'light-content' : 'dark-content';

export const nativeStackStatusBarStyleForTheme = theme =>
  theme === 'dark' ? 'light' : 'dark';

export const nativeStackStatusBarOptions = (theme, backgroundColor) => ({
  statusBarBackgroundColor: backgroundColor,
  statusBarStyle: nativeStackStatusBarStyleForTheme(theme),
});
