# Installation

Before [PR](https://github.com/xenova/transformers.js/pull/118) merge, you should use this installation step.

```sh
# Install from source
 npm i 'mybigday/transformers.js#merge'

# or prerelease maintained by BRICKS
npm i @fugood/transformers
```

# Basic Polyfills & Fixes

https://github.com/hans00/react-native-transformers-example/blob/a0060d16550891618fb47ec8766ca4e460b1f1a6/polyfills.js#L2-L16

https://github.com/hans00/react-native-transformers-example/blob/b8321a715e14004d096c6487a255fc4be625c9d9/babel.config.js#L4

# Android

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

# Onnxruntime

## Version

Should ensure `onnxruntime-common` and `onnxruntime-react-native` version are same.
You could using `resolution` (yarn) or `overrides` (npm) to force them.

For example.
https://github.com/hans00/react-native-transformers-example/blob/16550bac60d2d383c0ee32cd41ee31adc57766a7/package.json#L71-L77

## ONNX Runtime patch work for LM models

> If you use `onnxruntime-react-native<1.17.0`, you should patch the library.

- [Allow the creation of boolean tensors from ByteBuffer](https://github.com/microsoft/onnxruntime/pull/15556) (It included in v1.16.1, Required for language model)
- [Allows the creation and extraction of zero length tensors](https://github.com/microsoft/onnxruntime/pull/15116) (It included in v1.15, Required for LLM KV cache)
- [[js/rn] Support create boolean tensor](https://github.com/microsoft/onnxruntime/pull/17052) (It included in v1.17.0, Required for language model)
- [[js/rn] Support load external data](https://github.com/microsoft/onnxruntime/pull/20090) (It included in v1.18.0, Required for large model)

# Performance Improvement

## Image Process

### Way 1: GCanvas

https://github.com/hans00/react-native-transformers-example/tree/gcanvas

> May make app unstable.
> Should more reuse canvas instance

- `@flyskywhy/react-native-browser-polyfill`
- `@flyskywhy/react-native-gcanvas`

#### Known Issue

- The offscreen canvas too small will not get full decoded image data.
- The canvas too large will crash.
- Create too many canvas may cause crash (include refresh app).

### Way 2: Skia

> Stable, but slightly slower than gcanvas

https://github.com/hans00/react-native-transformers-example/blob/a0060d16550891618fb47ec8766ca4e460b1f1a6/polyfills.js#L1
