import type {
  BudgetTier,
  PaletteType,
  Project,
  ProjectSize,
  ProjectStyle,
} from "../data/projects.ts";
import { matchesCustomPalette, paletteDistance } from "./color.ts";

export type ProjectFilters = {
  style: ProjectStyle | null;
  size: ProjectSize | null;
  palette: PaletteType | "custom" | null;
  budget: BudgetTier | null;
  customColors: [string, string];
};

export const emptyFilters: ProjectFilters = {
  style: null,
  size: null,
  palette: null,
  budget: null,
  customColors: ["#75543a", "#d8c9b9"],
};

export function hasActiveFilters(filters: ProjectFilters) {
  return Boolean(filters.style || filters.size || filters.palette || filters.budget);
}

export function filterProjects(projects: Project[], filters: ProjectFilters) {
  return projects.filter((project) => {
    if (filters.style && project.style !== filters.style) return false;
    if (filters.size && project.size !== filters.size) return false;
    if (filters.budget && project.budgetTier !== filters.budget) return false;
    if (filters.palette === "custom") {
      if (!matchesCustomPalette(filters.customColors, project.colors)) return false;
    } else if (filters.palette && project.paletteType !== filters.palette) {
      return false;
    }
    return true;
  });
}

export function closestProjects(projects: Project[], filters: ProjectFilters) {
  return [...projects]
    .map((project) => {
      let score = 0;
      if (filters.style && project.style !== filters.style) score += 40;
      if (filters.size && project.size !== filters.size) score += 24;
      if (filters.budget && project.budgetTier !== filters.budget) score += 18;
      if (filters.palette === "custom") {
        score += paletteDistance(filters.customColors, project.colors);
      } else if (filters.palette && project.paletteType !== filters.palette) {
        score += 32;
      }
      return { project, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(({ project }) => project);
}
