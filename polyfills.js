import {
  Skia,
  matchFont,
  ColorType,
  AlphaType,
  PaintStyle,
  rect,
} from '@shopify/react-native-skia'; // for OffscreenCanvas
import 'text-encoding-polyfill'; // support TextEncoder
import { Buffer } from 'buffer';
import XRegExp from 'xregexp';
import { EventEmitter } from 'tseep';

global.Buffer = Buffer;

// replace default RegExp to support unicode
const nativeRegExp = global.RegExp;
const newRegExp = (...args) => {
  global.RegExp = nativeRegExp;
  const result = XRegExp(...args);
  global.RegExp = newRegExp;
  return result;
};
global.RegExp = newRegExp;

// Optional polyfill for console.time
const timers = new Map();
console.time ??= ((label) => {
  timers.set(label, Date.now());
});
console.timeEnd ??= ((label) => {
  const start = timers.get(label);
  if (start) {
    console.log(`${label}: ${Date.now() - start}ms`);
    timers.delete(label);
  }
});

// OffscreenCanvas, Image, etc.
global.Image = class ImagePolyfill extends EventEmitter {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
    this._onload = null;
    this._onerror = null;
    this._src = null;
    this._image = null;
  }

  set onload(value) {
    if (this._onload) {
      this.removeListener('load', this._onload);
    }
    this._onload = value;
    if (this._onload) {
      if (this._image) {
        this._onload();
      } else {
        this.addListener('load', this._onload);
      }
    }
  }

  get onload() {
    return this._onload;
  }

  set onerror(value) {
    if (this._onerror) {
      this.removeListener('error', this._onerror);
    }
    this._onerror = value;
    if (this._onerror) {
      this.addListener('error', this._onerror);
    }
  }

  get onerror() {
    return this._onerror;
  }

  set src(value) {
    this._src = value;
    Skia.Data.fromURI(value)
      .then((data) => {
        this._image = Skia.Image.MakeImageFromEncoded(data);
        data.dispose();
        if (!this.width) {
          this.width = this._image.width();
        }
        if (!this.height) {
          this.height = this._image.height();
        }
        this.emit('load');
      })
      .catch((err) => {
        this.emit('error', err);
      });
  }

  get src() {
    return this._src;
  }
}

global.ImageData = class ImageDataPolyfill {
  constructor() {
    if (arguments.length === 2) {
      this.width = arguments[0];
      this.height = arguments[1];
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.width = arguments[1];
      this.height = arguments[2];
      this.data = arguments[0];
    }
  }
}

const getImageInfo = (width, height) => ({
  width,
  height,
  colorType: ColorType.RGBA_8888,
  alphaType: AlphaType.Unpremul,
})

const getFont = (font) => {
  const match = font?.match(/(?:(\w+) )?(\d+)(px|pt) (.*)/);
  if (match) {
    let size = parseInt(match[2]);
    if (match[3] === 'pt') {
      size = Math.round(size * 1.3333333333333333);
    }
    return matchFont({
      fontFamily: match[3],
      fontWeight: match[1] ?? 'normal',
      fontSize: size,
    });
  } else {
    return matchFont({ fontSize: 10 });
  }
}

const getPaint = (style, color, lineWidth=0) => {
  const paint = Skia.Paint();
  if (style !== undefined) {
    paint.setStyle(style);
  }
  if (color) {
    paint.setColor(Skia.Color(color));
  }
  if (lineWidth && style === PaintStyle.Stroke) {
    paint.setStrokeWidth(lineWidth);
  }
  return paint;
}

global.CanvasRenderingContext2D = class CanvasRenderingContext2DPolyfill {
  constructor(canvas, surface) {
    this.canvas = canvas;
    this.surface = canvas.surface;
    this._ctx = canvas.surface.getCanvas();
    this.lineWidth = 1;
    this.strokeStyle = '#000000';
    this.fillStyle = '#000000';
    this.font = '10px sans-serif';
  }

  putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    console.time('putImageData');
    const { data, width, height } = imageData;
    const skData = Skia.Data.fromBytes(data);
    const image = Skia.Image.MakeImage(getImageInfo(width, height), skData, 4 * width);
    skData.dispose();
    if (arguments.length === 3) {
      this._ctx.drawImage(image, dx, dy);
    } else {
      this._ctx.drawImageRect(
        image,
        {
          x: dirtyX,
          y: dirtyY,
          width: dirtyWidth,
          height: dirtyHeight
        },
        {
          x: dx,
          y: dy,
          width: dirtyWidth,
          height: dirtyHeight
        },
        getPaint(),
      );
    }
    image.dispose();
    console.timeEnd('putImageData');
  }

  getImageData(sx=0, sy=0, sw, sh) {
    console.time('getImageData');
    const width = sw ?? this.canvas.width;
    const height = sh ?? this.canvas.height;
    const pixels = this._ctx.readPixels(sx, sy, getImageInfo(width, height), undefined, 4 * width);
    console.timeEnd('getImageData');
    return new ImageData(pixels, width, height);
  }

  drawImage(image, dx, dy, dw, dh, sx, sy, sw, sh) {
    console.time('drawImage');
    let img;
    let width;
    let height;
    if (image._image) {
      img = image._image;
      width = image.width;
      height = image.height;
    } else if (image.surface) {
      img = image.surface.makeImageSnapshot();
      width = image.width;
      height = image.height;
    } else {
      throw new Error('Invalid image');
    }
    if (arguments.length === 3) {
      this._ctx.drawImage(img, dx, dy);
    } else if (arguments.length === 5) {
      this._ctx.drawImageRect(
        img,
        {
          x: 0,
          y: 0,
          width,
          height
        },
        {
          x: dx,
          y: dy,
          width: dw,
          height: dh
        },
        getPaint(),
      );
    } else {
      this._ctx.drawImageRect(
        img,
        {
          x: sx,
          y: sy,
          width: sw,
          height: sh
        },
        {
          x: dx,
          y: dy,
          width: dw,
          height: dh
        },
        getPaint(),
      );
    }
    if (image.surface) {
      img.dispose();
    }
    console.timeEnd('drawImage');
  }

  fillText(text, x, y, maxWidth) {
    const font = getFont(this.font);
    const paint = getPaint(PaintStyle.Fill, this.fillStyle);
    this._ctx.drawText(text, x, y, font, paint);
    font.dispose();
    paint.dispose();
  }

  strokeText(text, x, y, maxWidth) {
    const font = getFont(this.font);
    const paint = getPaint(PaintStyle.Stroke, this.strokeStyle, this.lineWidth);
    this._ctx.drawText(text, x, y, font, paint);
    font.dispose();
    paint.dispose();
  }

  beginPath() {
    this._mode = 'path';
    this._path = Skia.Path.Make();
  }

  moveTo(x, y) {
    this._path?.moveTo(x, y);
  }

  lineTo(x, y) {
    this._path?.lineTo(x, y);
  }

  closePath() {
    this._path?.close();
  }

  rect(x, y, w, h) {
    this._mode = 'rect';
    this._rect = rect(x, y, w, h);
  }

  _draw(style) {
    const paint = getPaint(
      style,
      style === PaintStyle.Stroke ? this.strokeStyle : this.fillStyle,
      this.lineWidth
    );
    switch (this._mode) {
      case 'rect':
        this._ctx.drawRect(this._rect, paint);
        this._rect.dispose();
        break;
      case 'path':
        this._ctx.drawPath(this._path, paint);
        this._path.dispose();
        break;
    }
    this._mode = null;
    this._rect = null;
    this._path = null;
    paint.dispose();
  }

  stroke() {
    this._draw(PaintStyle.Stroke);
  }

  fill() {
    this._draw(PaintStyle.Fill);
  }

  fillRect(x, y, w, h) {
    this._ctx.drawRect(rect(x, y, w, h), getPaint(PaintStyle.Fill, this.fillStyle));
  }

  save() {
    this._ctx.save();
  }

  restore() {
    this._ctx.restore();
  }

  dispose() {
    this._ctx.dispose();
  }
};

global.OffscreenCanvas = class OffscreenCanvasPolyfill {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.surface = Skia.Surface.MakeOffscreen(width, height);
  }

  transferToImageBitmap() {
    throw new Error('Method not implemented.');
  }

  addEventListener(type, listener, options) {
    throw new Error('Method not implemented.');
  }

  removeEventListener(type, listener, options) {
    throw new Error('Method not implemented.');
  }

  dispatchEvent(event) {
    throw new Error('Method not implemented.');
  }

  getContext(ctx) {
    if (ctx === '2d') {
      return new CanvasRenderingContext2D(this);
    }
    return null;
  }

  dispose() {
    this.surface.dispose();
  }
};
