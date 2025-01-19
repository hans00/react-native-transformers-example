module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    'babel-plugin-transform-import-meta',
    ['module-resolver', {
      alias: {
        'buffer': '@craftzdog/react-native-buffer',
        'av': require.resolve('./aurora.js'),
      },
    }],
  ],
};
