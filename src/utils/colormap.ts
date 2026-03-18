import type { ColormapName } from '../types';

type RGB = [number, number, number];

const viridisData: RGB[] = [
  [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141],
  [41, 120, 142], [32, 144, 140], [34, 167, 132], [68, 190, 112],
  [121, 209, 81], [189, 222, 38], [253, 231, 37],
];

const plasmaData: RGB[] = [
  [13, 8, 135], [75, 3, 161], [125, 3, 168], [168, 34, 150],
  [203, 70, 121], [229, 107, 93], [248, 148, 65], [253, 195, 40],
  [240, 249, 33],
];

const turboData: RGB[] = [
  [48, 18, 59], [86, 91, 214], [29, 162, 255], [21, 215, 186],
  [99, 248, 97], [193, 243, 33], [253, 187, 49], [246, 108, 24],
  [191, 39, 5],
];

const coolwarmData: RGB[] = [
  [59, 76, 192], [98, 130, 234], [141, 176, 254], [184, 208, 249],
  [221, 221, 221], [245, 196, 173], [244, 154, 123], [222, 96, 77],
  [180, 4, 38],
];

const colormaps: Record<ColormapName, RGB[]> = {
  viridis: viridisData,
  plasma: plasmaData,
  turbo: turboData,
  coolwarm: coolwarmData,
};

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function sampleColormap(name: ColormapName, t: number): RGB {
  const data = colormaps[name];
  const clamped = Math.max(0, Math.min(1, t));
  const idx = clamped * (data.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, data.length - 1);
  const frac = idx - lo;
  return lerpColor(data[lo], data[hi], frac);
}

export function colormapToCSS(name: ColormapName, t: number): string {
  const [r, g, b] = sampleColormap(name, t);
  return `rgb(${r},${g},${b})`;
}

export function generateColormapTexture(name: ColormapName, width: number = 256): Uint8Array {
  const data = new Uint8Array(width * 4);
  for (let i = 0; i < width; i++) {
    const [r, g, b] = sampleColormap(name, i / (width - 1));
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return data;
}
