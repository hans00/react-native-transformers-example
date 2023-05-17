module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    ['module-resolver', {
      alias: {
        'stream': 'stream-browserify',
        'buffer': '@craftzdog/react-native-buffer',
        'zlib': 'browserify-zlib',
      },
    }],
  ],
};
