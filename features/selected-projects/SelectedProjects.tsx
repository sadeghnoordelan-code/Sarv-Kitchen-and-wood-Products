"use client";

import { ArrowUpRight } from "lucide-react";
import { selectedProjects, type SelectedProject } from "@/data/selected-projects";

type Props = { onOpen: (project: SelectedProject) => void };

export function SelectedProjects({ onOpen }: Props) {
  return (
    <section id="selected-projects" className="selected-section">
      <div className="selected-heading">
        <p className="eyebrow brown">02 — Selected projects</p>
        <h2>Complete interiors,<br /><i>resolved</i> as one.</h2>
      </div>
      <div className="selected-list">
        {selectedProjects.map((project, index) => (
          <article key={project.id} className={`selected-item selected-item-${index + 1}`}>
            <button className="selected-image" type="button" onClick={() => onOpen(project)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.images[0]} alt={`${project.title} interior`} loading="lazy" />
              <span className="selected-open">View project <ArrowUpRight /></span>
            </button>
            <div className="selected-meta">
              <span>{project.index}</span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.type} · {project.location}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
