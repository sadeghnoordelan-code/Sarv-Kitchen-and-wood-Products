"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { categories, projects, type CategoryId } from "@/data/projects";

type Props = { onOpen: (category: CategoryId) => void };

export function CategoryBrowser({ onOpen }: Props) {
  const [active, setActive] = useState<CategoryId>("kitchen");
  const activeCategory = categories.find((item) => item.id === active) ?? categories[0];
  const activeProject = useMemo(
    () => projects.find((item) => item.category === active) ?? projects[0],
    [active],
  );

  return (
    <section id="categories" className="category-intro">
      <div className="section-heading">
        <p className="eyebrow brown">01 — Disciplines</p>
        <h2>
          One material language.
          <br /><i>Six</i> ways into a space.
        </h2>
        <p className="section-copy">
          Explore our work by architectural element, then refine the collection by style,
          scale, palette and investment.
        </p>
      </div>
      <div className="category-stage">
        <button className="category-image-wrap" type="button" onClick={() => onOpen(active)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeProject.image} alt={`${activeProject.title}, ${activeCategory.title}`} />
          <span className="image-caption">
            <span>{activeCategory.title} · {activeProject.title}</span>
            <span>{activeProject.location}</span>
          </span>
        </button>
        <ol className="category-list">
          {categories.map((category) => (
            <li key={category.id} className={category.id === active ? "active" : ""}>
              <button
                type="button"
                onMouseEnter={() => setActive(category.id)}
                onFocus={() => setActive(category.id)}
                onClick={() => onOpen(category.id)}
                aria-label={`Open ${category.title} projects`}
              >
                <span>{category.index}</span>
                <span className="category-copy">
                  <strong>{category.title}</strong>
                  <small>{category.description}</small>
                </span>
                <ArrowUpRight />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
