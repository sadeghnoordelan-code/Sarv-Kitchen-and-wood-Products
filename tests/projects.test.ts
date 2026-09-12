import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { categories, projects, validateProjects } from "../data/projects.ts";
import { selectedProjects } from "../data/selected-projects.ts";
import { filterProjects, emptyFilters } from "../lib/filtering.ts";
import { matchesCustomPalette } from "../lib/color.ts";

test("the project matrix is complete, unique and internally consistent", () => {
  assert.deepEqual(validateProjects(projects), []);
  assert.equal(projects.length, 30);
  assert.equal(new Set(projects.map((project) => project.image)).size, 30);
  for (const category of categories) {
    assert.equal(projects.filter((project) => project.category === category.id).length, 5);
  }
  for (const project of projects) {
    assert.ok(existsSync(join(process.cwd(), "public", project.image)));
  }
});

test("strict filters use logical AND", () => {
  const kitchen = projects.filter((project) => project.category === "kitchen");
  assert.equal(filterProjects(kitchen, emptyFilters).length, 5);
  assert.deepEqual(
    filterProjects(kitchen, {
      ...emptyFilters,
      style: "modern",
      size: "large",
      palette: "dark",
      budget: "500m-1b",
    }).map((project) => project.id),
    ["kitchen-01"],
  );
  assert.deepEqual(
    filterProjects(kitchen, { ...emptyFilters, style: "classic", palette: "dark" }),
    [],
  );
  assert.deepEqual(
    filterProjects(kitchen, {
      ...emptyFilters,
      style: "industrial",
      size: "small",
      palette: "dark",
      budget: "100m-500m",
    }).map((project) => project.id),
    ["kitchen-04"],
  );
});

test("custom colors only return perceptual matches", () => {
  const kitchen = projects.filter((project) => project.category === "kitchen");
  const colors: [string, string] = ["#171717", "#4b3a2f"];
  const result = filterProjects(kitchen, { ...emptyFilters, palette: "custom", customColors: colors });
  assert.ok(result.length > 0);
  assert.ok(result.every((project) => matchesCustomPalette(colors, project.colors)));
});

test("selected projects have coherent two-image sets and no private data", () => {
  assert.equal(selectedProjects.length, 3);
  for (const project of selectedProjects) {
    assert.equal(project.images.length, 2);
    assert.equal(new Set(project.images).size, 2);
    assert.ok(project.images.every((image) => existsSync(join(process.cwd(), "public", image))));
  }
});
