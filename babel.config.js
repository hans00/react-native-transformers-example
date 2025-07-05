module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {
      alias: {
        'buffer': '@craftzdog/react-native-buffer',
        'av': require.resolve('./aurora.js'),
      },
    }],
  ],
};
