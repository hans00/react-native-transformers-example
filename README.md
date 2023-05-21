# transformers.js on ReactNative

## Setup

### Polyfills

- `text-encoding-polyfill`
- `assert`
- `events`
- `util`

```js
global.Buffer = Buffer;
```

### Babel config

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

### ONNX Runtime patch work for LM models

- [Allow the creation of boolean tensors from ByteBuffer](https://github.com/microsoft/onnxruntime/pull/15556)
- [Allows the creation and extraction of zero length tensors](https://github.com/microsoft/onnxruntime/pull/15116)

```diff
diff --git a/java/src/main/java/ai/onnxruntime/OnnxTensor.java b/java/src/main/java/ai/onnxruntime/OnnxTensor.java
index c5e60a3dba..89b50f259f 100644
--- a/java/src/main/java/ai/onnxruntime/OnnxTensor.java
+++ b/java/src/main/java/ai/onnxruntime/OnnxTensor.java
@@ -76,7 +76,10 @@ public class OnnxTensor extends OnnxTensorLike {
       }
     } else {
       Object carrier = info.makeCarrier();
-      getArray(OnnxRuntime.ortApiHandle, nativeHandle, carrier);
+      if (info.getNumElements() > 0) {
+        // If the tensor has values copy them out
+        getArray(OnnxRuntime.ortApiHandle, nativeHandle, carrier);
+      }
       if ((info.type == OnnxJavaType.STRING) && (info.shape.length != 1)) {
         // We read the strings out from native code in a flat array and then reshape
         // to the desired output shape.
diff --git a/java/src/main/java/ai/onnxruntime/OrtUtil.java b/java/src/main/java/ai/onnxruntime/OrtUtil.java
index ca340676e2..370f5e8146 100644
--- a/java/src/main/java/ai/onnxruntime/OrtUtil.java
+++ b/java/src/main/java/ai/onnxruntime/OrtUtil.java
@@ -41,9 +41,9 @@ public final class OrtUtil {
     int[] newShape = new int[shape.length];
     for (int i = 0; i < shape.length; i++) {
       long curDim = shape[i];
-      if (curDim < 1 || curDim > Integer.MAX_VALUE) {
+      if (curDim < 0 || curDim > Integer.MAX_VALUE) {
         throw new IllegalArgumentException(
-            "Invalid shape for a Java array, expected positive entries smaller than Integer.MAX_VALUE. Found "
+            "Invalid shape for a Java array, expected non-negative entries smaller than Integer.MAX_VALUE. Found "
                 + Arrays.toString(shape));
       } else {
         newShape[i] = (int) curDim;
@@ -345,7 +345,7 @@ public final class OrtUtil {
   /**
    * Counts the number of elements stored in a Tensor of this shape.
    *
-   * <p>Multiplies all the elements together if they are positive, throws an {@link
+   * <p>Multiplies all the elements together if they are non-negative, throws an {@link
    * IllegalArgumentException} otherwise.
    *
    * @param shape The shape to use.
@@ -354,11 +354,11 @@ public final class OrtUtil {
   public static long elementCount(long[] shape) {
     long count = 1;
     for (int i = 0; i < shape.length; i++) {
-      if (shape[i] > 0) {
+      if (shape[i] >= 0) {
         count *= shape[i];
       } else {
         throw new IllegalArgumentException(
-            "Received non-positive value in shape " + Arrays.toString(shape) + " .");
+            "Received negative value in shape " + Arrays.toString(shape) + " .");
       }
     }
     return count;
@@ -519,6 +519,7 @@ public final class OrtUtil {
         case DOUBLE:
           tmp = buffer.asDoubleBuffer().put((DoubleBuffer) data);
           break;
+        case BOOL:
         case UINT8:
         case INT8:
           // buffer is already a ByteBuffer, no cast needed.
@@ -533,7 +534,6 @@ public final class OrtUtil {
         case INT64:
           tmp = buffer.asLongBuffer().put((LongBuffer) data);
           break;
-        case BOOL:
         case STRING:
         case UNKNOWN:
         default:
diff --git a/java/src/main/java/ai/onnxruntime/TensorInfo.java b/java/src/main/java/ai/onnxruntime/TensorInfo.java
index b9b7835da2..6a2096a2af 100644
--- a/java/src/main/java/ai/onnxruntime/TensorInfo.java
+++ b/java/src/main/java/ai/onnxruntime/TensorInfo.java
@@ -107,6 +107,9 @@ public class TensorInfo implements ValueInfo {
   /** The native type of this tensor. */
   public final OnnxTensorType onnxType;
 
+  /** The number of elements in this tensor. */
+  final long numElements;
+
   /**
    * Constructs a TensorInfo with the specified shape, Java type and native type.
    *
@@ -118,6 +121,7 @@ public class TensorInfo implements ValueInfo {
     this.shape = shape;
     this.type = type;
     this.onnxType = onnxType;
+    this.numElements = elementCount(shape);
   }
 
   /**
@@ -132,6 +136,7 @@ public class TensorInfo implements ValueInfo {
     this.shape = shape;
     this.onnxType = OnnxTensorType.mapFromInt(typeInt);
     this.type = OnnxJavaType.mapFromOnnxTensorType(this.onnxType);
+    this.numElements = elementCount(shape);
   }
 
   /**
@@ -173,6 +178,39 @@ public class TensorInfo implements ValueInfo {
     return OrtUtil.validateShape(shape);
   }
 
+  /**
+   * Computes the number of elements in this tensor.
+   *
+   * <p>This replicates {@link OrtUtil#elementCount}, but does not throw on negative values which
+   * are used for symbolic dimensions in input and output info objects.
+   *
+   * @param shape The tensor shape.
+   * @return The number of elements.
+   */
+  private static long elementCount(long[] shape) {
+    // Java side tensors must be less than Integer.MAX_VALUE,
+    // tensors created in native code can be larger, but are not usable in Java.
+    // Tensors should not be able to be created which will overflow a 64-bit long.
+    long output = 1;
+    for (int i = 0; i < shape.length; i++) {
+      output *= shape[i];
+    }
+    return output;
+  }
+
+  /**
+   * Returns the number of elements in this tensor.
+   *
+   * <p>If the returned value is negative, then this tensor info refers to an input or output
+   * placeholder which has symbolic dimensions, and the element count cannot be computed without
+   * specifying the symbolic dimensions.
+   *
+   * @return The number of elements.
+   */
+  public long getNumElements() {
+    return numElements;
+  }
+
   /**
    * Constructs an array the right shape and type to hold this tensor.
    *
@@ -185,7 +223,7 @@ public class TensorInfo implements ValueInfo {
    *     greater than an int).
    */
   public Object makeCarrier() throws OrtException {
-    if (!validateShape()) {
+    if (!validateShape() && numElements != 0) {
       throw new OrtException(
           "This tensor is not representable in Java, it's too big - shape = "
               + Arrays.toString(shape));
```

## Performance Improvement

### GCanvas

> It will get better image decode performance.
> But may make app unstable.
> Should more reuse canvas instance

- `@flyskywhy/react-native-browser-polyfill`
- `@flyskywhy/react-native-gcanvas`

#### Known Issue

- The offscreen canvas too small will not get full decoded image data.
- The canvas too large will crash.
- Create too many canvas may cause crash (include refresh app).
