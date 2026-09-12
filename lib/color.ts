export type LabColor = { l: number; a: number; b: number };

function channelToLinear(value: number) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

export function hexToLab(hex: string): LabColor {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(clean)) return { l: 0, a: 0, b: 0 };
  const r = channelToLinear(Number.parseInt(clean.slice(0, 2), 16));
  const g = channelToLinear(Number.parseInt(clean.slice(2, 4), 16));
  const b = channelToLinear(Number.parseInt(clean.slice(4, 6), 16));
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const pivot = (value: number) =>
    value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function deltaE(first: string, second: string) {
  const a = hexToLab(first);
  const b = hexToLab(second);
  return Math.sqrt(
    Math.pow(a.l - b.l, 2) + Math.pow(a.a - b.a, 2) + Math.pow(a.b - b.b, 2),
  );
}

export function paletteDistance(selected: [string, string], project: [string, string]) {
  return selected.reduce(
    (sum, color) => sum + Math.min(...project.map((candidate) => deltaE(color, candidate))),
    0,
  ) / selected.length;
}

export const CUSTOM_COLOR_THRESHOLD = 18;

export function matchesCustomPalette(
  selected: [string, string],
  project: [string, string],
) {
  return selected.every(
    (color) => Math.min(...project.map((candidate) => deltaE(color, candidate))) <= CUSTOM_COLOR_THRESHOLD,
  );
}
