const path = require('path');

module.exports = {
  dependencies: {
    // Use @fugood/onnxruntime-react-native
    'onnxruntime-react-native': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    '@flyskywhy/react-native-gcanvas': {
      platforms: {
        android: {
          packageImportPath: 'import com.taobao.gcanvas.bridges.rn.GReactPackage;',
        },
      },
    },
  },
};
