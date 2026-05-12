/* eslint-env jest */

import {
  nativeStackStatusBarOptions,
  nativeStackStatusBarStyleForTheme,
  statusBarStyleForTheme,
} from '../src/utils/status_bar';

describe('status bar styling', () => {
  it('uses light status bar content on dark app surfaces', () => {
    expect(statusBarStyleForTheme('dark')).toBe('light-content');
    expect(nativeStackStatusBarStyleForTheme('dark')).toBe('light');
  });

  it('uses dark status bar content on light or unknown app surfaces', () => {
    expect(statusBarStyleForTheme('light')).toBe('dark-content');
    expect(statusBarStyleForTheme(null)).toBe('dark-content');
    expect(nativeStackStatusBarStyleForTheme('light')).toBe('dark');
    expect(nativeStackStatusBarStyleForTheme(null)).toBe('dark');
  });

  it('builds native-stack status bar options with the app header colour', () => {
    expect(nativeStackStatusBarOptions('dark', '#212936')).toEqual({
      statusBarBackgroundColor: '#212936',
      statusBarStyle: 'light',
    });
  });
});
