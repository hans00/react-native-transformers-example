# JS Polyfills & Fixes

The [polyfills](./polyfills.js) to support some pipeline.

[Add babel plugins to support some syntax](https://github.com/hans00/react-native-transformers-example/blob/eaeda2d76b5ff50be710da0e89ce06821f71ec4b/babel.config.js#L4-L5)

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

## ONNX Runtime patch work for LM models

> Current has some changes not publish.

- [Allow the creation of boolean tensors from ByteBuffer](https://github.com/microsoft/onnxruntime/pull/15556) (It included in v1.16.1)
- [Allows the creation and extraction of zero length tensors](https://github.com/microsoft/onnxruntime/pull/15116) (It included in v1.15)
- [[js/rn] Support create boolean tensor](https://github.com/microsoft/onnxruntime/pull/17052)

# Performance Improvement

## Image Process

### GCanvas

> May make app unstable.
> Should more reuse canvas instance

- `@flyskywhy/react-native-browser-polyfill`
- `@flyskywhy/react-native-gcanvas`

#### Known Issue

- The offscreen canvas too small will not get full decoded image data.
- The canvas too large will crash.
- Create too many canvas may cause crash (include refresh app).
