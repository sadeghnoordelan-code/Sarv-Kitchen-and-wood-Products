import type { CategoryProject } from "./projects";

export const exactColorDeltaEThreshold = 2.3;

type LabColor = {
  l: number;
  a: number;
  b: number;
};

export type CustomPalette = readonly [string, string];

export type ProjectColorMatch = {
  project: CategoryProject;
  distance: number;
};

const hexPattern = /^#?([0-9a-f]{6})$/i;

export const normalizeHexColor = (input: string) => {
  const match = input.trim().match(hexPattern);
  return match ? `#${match[1].toUpperCase()}` : null;
};

const srgbChannelToLinear = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const labPivot = (value: number) => {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  return value > epsilon ? Math.cbrt(value) : (kappa * value + 16) / 116;
};

export const hexToLab = (input: string): LabColor | null => {
  const normalized = normalizeHexColor(input);
  if (!normalized) return null;

  const red = srgbChannelToLinear(Number.parseInt(normalized.slice(1, 3), 16));
  const green = srgbChannelToLinear(
    Number.parseInt(normalized.slice(3, 5), 16),
  );
  const blue = srgbChannelToLinear(
    Number.parseInt(normalized.slice(5, 7), 16),
  );

  const x = (red * 0.4124564 + green * 0.3575761 + blue * 0.1804375) / 0.95047;
  const y = red * 0.2126729 + green * 0.7151522 + blue * 0.072175;
  const z = (red * 0.0193339 + green * 0.119192 + blue * 0.9503041) / 1.08883;

  const pivotX = labPivot(x);
  const pivotY = labPivot(y);
  const pivotZ = labPivot(z);

  return {
    l: 116 * pivotY - 16,
    a: 500 * (pivotX - pivotY),
    b: 200 * (pivotY - pivotZ),
  };
};

export const deltaE76 = (first: LabColor, second: LabColor) =>
  Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);

export const getPaletteDeltaE = (
  requestedPalette: CustomPalette,
  projectPalette: CustomPalette,
) => {
  const requested = requestedPalette.map(hexToLab);
  const project = projectPalette.map(hexToLab);

  if (requested.some((color) => color === null) || project.some((color) => color === null)) {
    return Number.POSITIVE_INFINITY;
  }

  const [requestedFirst, requestedSecond] = requested as [LabColor, LabColor];
  const [projectFirst, projectSecond] = project as [LabColor, LabColor];
  const directDistance =
    (deltaE76(requestedFirst, projectFirst) +
      deltaE76(requestedSecond, projectSecond)) /
    2;
  const swappedDistance =
    (deltaE76(requestedFirst, projectSecond) +
      deltaE76(requestedSecond, projectFirst)) /
    2;

  return Math.min(directDistance, swappedDistance);
};

export const matchProjectsByCustomPalette = (
  projects: readonly CategoryProject[],
  requestedPalette: CustomPalette,
  exactThreshold = exactColorDeltaEThreshold,
) => {
  const rankedMatches = projects
    .map((project) => ({
      project,
      distance: getPaletteDeltaE(requestedPalette, project.colors),
    }))
    .filter((match) => Number.isFinite(match.distance));

  return {
    exact: rankedMatches.filter((match) => match.distance <= exactThreshold),
    closest: rankedMatches
      .filter((match) => match.distance > exactThreshold)
      .sort(
        (first, second) =>
          first.distance - second.distance ||
          first.project.id.localeCompare(second.project.id),
      ),
  };
};
