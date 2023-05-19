module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    'babel-plugin-transform-import-meta',
    ['module-resolver', {
      alias: {
        'stream/web': 'stream-browserify',
        'stream': 'stream-browserify',
        'buffer': '@craftzdog/react-native-buffer',
        'zlib': 'browserify-zlib',
        'fs': 'react-native-fs',
        'path': 'path-browserify',
        'onnxruntime-node': 'onnxruntime-react-native',
      },
    }],
  ],
};
