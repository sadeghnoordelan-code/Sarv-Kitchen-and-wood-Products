export const motion = {
  fast: 180,
  medium: 420,
  slow: 760,
  page: 920,
} as const;

export const ease = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  cinematic: "cubic-bezier(0.76, 0, 0.24, 1)",
  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.7, 0, 0.84, 0)",
} as const;
