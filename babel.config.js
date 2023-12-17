module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    [
      'module-resolver',
      {
        alias: {
          'stream': 'stream-browserify',
          'buffer': '@craftzdog/react-native-buffer',
        },
      },
    ],
  ]
};
