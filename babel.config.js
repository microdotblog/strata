module.exports = {
  presets: ['babel-preset-expo'],
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
