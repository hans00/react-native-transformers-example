# Installation

Before [PR](https://github.com/xenova/transformers.js/pull/118) merge, you should use this installation step.

```sh
# Install from source
 npm i 'hans00/transformers.js#merge'

# or prerelease maintained by BRICKS
npm i @fugood/transformers
```

# Basic Polyfills & Fixes

https://github.com/hans00/react-native-transformers-example/blob/a0060d16550891618fb47ec8766ca4e460b1f1a6/polyfills.js#L2-L16

https://github.com/hans00/react-native-transformers-example/blob/74fd92546bd054177272d5155f1389a159f35f1f/babel.config.js#L4-L5

Alternative for `babel-plugin-transform-import-meta` you could do `patch-package`

```diff
diff --git a/node_modules/@fugood/transformers/src/env.js b/node_modules/@fugood/transformers/src/env.js
index d2699da..b9cd563 100644
--- a/node_modules/@xenova/transformers/src/env.js
+++ b/node_modules/@xenova/transformers/src/env.js
@@ -24,7 +24,6 @@
 
 import fs from 'fs';
 import path from 'path';
-import url from 'url';
 import { Buffer } from 'buffer';
 
 import { ONNX } from './backends/onnx.js';
@@ -44,7 +43,7 @@ let localPath = './';
 if (IS_REACT_NATIVE) {
     localPath = fs.DocumentDirectoryPath;
 } else if (RUNNING_LOCALLY) {
-    localPath = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
+    localPath = path.dirname(path.dirname(__filename));
 }
 
 // Only used for environments with access to file system
```

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

https://github.com/hans00/react-native-transformers-example/blob/2487917c52560c4dd477d4e7fabe7bb8f2d37f64/package.json#L75-L76

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
