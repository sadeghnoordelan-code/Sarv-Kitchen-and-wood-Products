import {
  budgetTiers,
  paletteTypes,
  projectSizes,
  projectStyles,
} from "./projects";
import type {
  BudgetTier,
  CategoryProject,
  PaletteType,
  ProjectSize,
  ProjectStyle,
} from "./projects";

export type ProjectFilters = {
  style: ProjectStyle | null;
  size: ProjectSize | null;
  paletteType: PaletteType | null;
  budgetTier: BudgetTier | null;
};

export type ProjectFilterKey = keyof ProjectFilters;

export type ActiveProjectFilter = {
  key: ProjectFilterKey;
  value: ProjectStyle | ProjectSize | PaletteType | BudgetTier;
};

export const createEmptyProjectFilters = (): ProjectFilters => ({
  style: null,
  size: null,
  paletteType: null,
  budgetTier: null,
});

export const filterProjects = (
  projects: readonly CategoryProject[],
  filters: ProjectFilters,
) =>
  projects.filter(
    (project) =>
      (filters.style === null || project.style === filters.style) &&
      (filters.size === null || project.size === filters.size) &&
      (filters.paletteType === null ||
        project.paletteType === filters.paletteType) &&
      (filters.budgetTier === null ||
        project.budgetTier === filters.budgetTier),
  );

export const getProjectFilterOptions = (
  projects: readonly CategoryProject[],
) => ({
  style: projectStyles.filter((value) =>
    projects.some((project) => project.style === value),
  ),
  size: projectSizes.filter((value) =>
    projects.some((project) => project.size === value),
  ),
  paletteType: paletteTypes.filter((value) =>
    projects.some((project) => project.paletteType === value),
  ),
  budgetTier: budgetTiers.filter((value) =>
    projects.some((project) => project.budgetTier === value),
  ),
});

export const getActiveProjectFilters = (
  filters: ProjectFilters,
): ActiveProjectFilter[] => {
  const activeFilters: ActiveProjectFilter[] = [];

  if (filters.style !== null) {
    activeFilters.push({ key: "style", value: filters.style });
  }
  if (filters.size !== null) {
    activeFilters.push({ key: "size", value: filters.size });
  }
  if (filters.paletteType !== null) {
    activeFilters.push({ key: "paletteType", value: filters.paletteType });
  }
  if (filters.budgetTier !== null) {
    activeFilters.push({ key: "budgetTier", value: filters.budgetTier });
  }

  return activeFilters;
};
