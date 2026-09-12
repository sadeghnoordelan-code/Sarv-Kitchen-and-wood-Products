"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import {
  budgetLabels,
  categories,
  projects,
  styleLabels,
  type BudgetTier,
  type CategoryId,
  type PaletteType,
  type Project,
  type ProjectSize,
  type ProjectStyle,
} from "@/data/projects";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  closestProjects,
  emptyFilters,
  filterProjects,
  hasActiveFilters,
  type ProjectFilters,
} from "@/lib/filtering";

type Props = {
  categoryId: CategoryId;
  onClose: () => void;
  onChangeCategory: (category: CategoryId) => void;
};

const sizes: ProjectSize[] = ["small", "medium", "large"];
const palettes: PaletteType[] = ["dark", "white", "gray"];
const budgets: BudgetTier[] = ["100m-500m", "500m-1b", "1b-2b"];
const styles = Object.keys(styleLabels) as ProjectStyle[];

function toggleFilter<K extends "style" | "size" | "palette" | "budget">(
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilters>>,
  key: K,
  value: ProjectFilters[K],
) {
  setFilters((current) => ({ ...current, [key]: current[key] === value ? null : value }));
}

function FiltersPanel({
  filters,
  setFilters,
  categoryProjects,
}: {
  filters: ProjectFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilters>>;
  categoryProjects: Project[];
}) {
  const styleImage = (style: ProjectStyle) =>
    categoryProjects.find((project) => project.style === style)?.image ?? categoryProjects[0]?.image;
  const setColor = (index: number, value: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    setFilters((current) => {
      const customColors = [...current.customColors] as [string, string];
      customColors[index] = value;
      return { ...current, palette: "custom", customColors };
    });
  };

  return (
    <div className="filters-panel">
      <fieldset>
        <legend>01 — Design style</legend>
        <div className="style-options">
          {styles.map((style) => (
            <button
              type="button"
              key={style}
              className={filters.style === style ? "selected" : ""}
              onClick={() => toggleFilter(setFilters, "style", style)}
              aria-pressed={filters.style === style}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={styleImage(style)} alt="" />
              <span>{styleLabels[style]}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>02 — Space size</legend>
        <div className="segmented-options">
          {sizes.map((size) => (
            <button type="button" key={size} className={filters.size === size ? "selected" : ""} onClick={() => toggleFilter(setFilters, "size", size)} aria-pressed={filters.size === size}>
              {size}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>03 — Color palette</legend>
        <div className="palette-options">
          {palettes.map((palette) => (
            <button type="button" key={palette} className={filters.palette === palette ? "selected" : ""} onClick={() => toggleFilter(setFilters, "palette", palette)} aria-pressed={filters.palette === palette}>
              <i className={`palette-${palette}`} />{palette}
            </button>
          ))}
          <button type="button" className={filters.palette === "custom" ? "selected" : ""} onClick={() => toggleFilter(setFilters, "palette", "custom")} aria-pressed={filters.palette === "custom"}>
            <i className="palette-custom" style={{ background: `linear-gradient(135deg, ${filters.customColors[0]} 50%, ${filters.customColors[1]} 50%)` }} />Custom
          </button>
        </div>
        {filters.palette === "custom" && (
          <div className="custom-colors">
            {filters.customColors.map((color, index) => (
              <label key={index}>
                <span>Color {index === 0 ? "A" : "B"}</span>
                <span className="color-control">
                  <input type="color" value={color} onChange={(event) => setColor(index, event.target.value)} aria-label={`Choose custom color ${index === 0 ? "A" : "B"}`} />
                  <input type="text" value={color.toUpperCase()} onChange={(event) => setColor(index, event.target.value)} aria-label={`Custom color ${index === 0 ? "A" : "B"} hex value`} maxLength={7} spellCheck={false} />
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <fieldset>
        <legend>04 — Estimated investment</legend>
        <div className="budget-options">
          {budgets.map((budget) => (
            <button type="button" key={budget} className={filters.budget === budget ? "selected" : ""} onClick={() => toggleFilter(setFilters, "budget", budget)} aria-pressed={filters.budget === budget}>
              {budgetLabels[budget]}
            </button>
          ))}
        </div>
        <small className="estimate-note">Indicative project tiers, not quotations.</small>
      </fieldset>
      {hasActiveFilters(filters) && (
        <button className="reset-filters" type="button" onClick={() => setFilters({ ...emptyFilters })}>
          Reset filters <X />
        </button>
      )}
    </div>
  );
}

function ProjectFigure({ project }: { project: Project }) {
  return (
    <figure className="result-project">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.image} alt={`${project.title}, ${styleLabels[project.style]} ${project.category}`} loading="lazy" />
      </div>
      <figcaption>
        <span>{project.title}</span>
        <small>{styleLabels[project.style]} · {project.location}</small>
      </figcaption>
    </figure>
  );
}

export function CategoryWorkspace({ categoryId, onClose, onChangeCategory }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [filters, setFilters] = useState<ProjectFilters>({ ...emptyFilters });
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const categoryIndex = categories.findIndex((item) => item.id === categoryId);
  const categoryProjects = useMemo(
    () => projects.filter((project) => project.category === categoryId),
    [categoryId],
  );
  const exactResults = useMemo(
    () => filterProjects(categoryProjects, filters),
    [categoryProjects, filters],
  );
  const closest = useMemo(
    () => exactResults.length === 0 && hasActiveFilters(filters) ? closestProjects(categoryProjects, filters) : [],
    [categoryProjects, exactResults.length, filters],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.querySelector('[data-slot="sheet-content"][data-state="open"]')) return;
      onClose();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [onClose]);

  const activePath = [
    filters.style ? styleLabels[filters.style] : null,
    filters.size,
    filters.palette === "custom" ? "Custom palette" : filters.palette,
    filters.budget ? budgetLabels[filters.budget] : null,
  ].filter(Boolean) as string[];
  const countLabel = exactResults.length === 0
    ? filters.palette === "custom" ? "No exact color match" : "No exact matches"
    : `${exactResults.length} ${exactResults.length === 1 ? "exact match" : "exact matches"}`;
  const previous = categories[(categoryIndex - 1 + categories.length) % categories.length];
  const next = categories[(categoryIndex + 1) % categories.length];

  if (!mounted) return null;
  return createPortal(
    <div className="experience-layer category-workspace" role="dialog" aria-modal="true" aria-label={`${category.title} projects`}>
      <header className="workspace-header">
        <button type="button" onClick={onClose}><ArrowLeft /> Back to categories</button>
        <a className="layer-wordmark" href="#top" onClick={onClose}>SARV</a>
        <span>{category.index} / 06</span>
      </header>
      <div className="workspace-hero">
        <div>
          <p className="eyebrow brown">{category.index} — Discipline</p>
          <h1>{category.title}</h1>
          <p>{category.description}</p>
        </div>
        <div className="workspace-lead-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={categoryProjects[0].image} alt={`${category.title} by SARV`} />
        </div>
      </div>
      <div className="workspace-body">
        <aside className="desktop-filters">
          <div className="filters-sticky">
            <p className="eyebrow">Refine the collection</p>
            <FiltersPanel filters={filters} setFilters={setFilters} categoryProjects={categoryProjects} />
          </div>
        </aside>
        <div className="results-area">
          <div className="results-toolbar">
            <div className="filter-path" aria-label="Active filters">
              <strong>{category.shortTitle}</strong>
              {activePath.map((item) => <span key={item}>/ {item}</span>)}
            </div>
            <span>{countLabel}</span>
            <Sheet>
              <SheetTrigger className="mobile-filter-trigger"><SlidersHorizontal /> Filters</SheetTrigger>
              <SheetContent side="bottom" className="filter-sheet">
                <SheetHeader>
                  <SheetTitle>Refine {category.shortTitle}</SheetTitle>
                  <SheetDescription>Filters combine precisely. Remove any choice to broaden results.</SheetDescription>
                </SheetHeader>
                <div className="filter-sheet-scroll">
                  <FiltersPanel filters={filters} setFilters={setFilters} categoryProjects={categoryProjects} />
                </div>
                <SheetFooter><SheetClose className="apply-filters">View {exactResults.length} {exactResults.length === 1 ? "project" : "projects"}</SheetClose></SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          {exactResults.length > 0 ? (
            <div className="results-grid">{exactResults.map((project) => <ProjectFigure key={project.id} project={project} />)}</div>
          ) : (
            <div className="empty-results">
              <span>00</span>
              <h2>{filters.palette === "custom" ? "No exact color match" : "No exact matches"}</h2>
              <p>Remove one choice to widen the exact result set. Approximate projects remain separate below.</p>
            </div>
          )}
          {closest.length > 0 && (
            <section className="closest-results">
              <div><p className="eyebrow brown">Closest matches</p><p>These projects do not satisfy every active filter.</p></div>
              <div className="closest-grid">{closest.map((project) => <ProjectFigure key={project.id} project={project} />)}</div>
            </section>
          )}
        </div>
      </div>
      <footer className="workspace-footer">
        <button type="button" onClick={() => onChangeCategory(previous.id)}><ArrowLeft /> {previous.shortTitle}</button>
        <button type="button" onClick={() => onChangeCategory(next.id)}>{next.shortTitle} <ArrowRight /></button>
      </footer>
    </div>,
    document.body,
  );
}
