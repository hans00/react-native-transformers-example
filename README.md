# transformers.js on ReactNative

## Setup

### Polyfills

- `text-encoding-polyfill`
- `assert
- `events`
- `util`

### Add these babel config

```js
[
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
]
```

## Android

- Add `largeHeap` to `android/app/src/main/AndroidManifest.xml`

```diff
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:roundIcon="@mipmap/ic_launcher_round"
  android:allowBackup="false"
  android:theme="@style/AppTheme"
+  android:largeHeap="true">
```
- Patch `onnxruntime-android` for LM usage
	- [Allow the creation of boolean tensors from ByteBuffer](https://github.com/microsoft/onnxruntime/pull/15556)
	- [Allows the creation and extraction of zero length tensors](https://github.com/microsoft/onnxruntime/pull/15116)
