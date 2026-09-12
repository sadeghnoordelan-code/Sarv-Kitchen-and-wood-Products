"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { SelectedProject } from "@/data/selected-projects";

type Props = { project: SelectedProject; onClose: () => void };

export function ProjectBrief({ project, onClose }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [imageIndex, setImageIndex] = useState(0);
  const imageCount = project.images.length;
  const previous = () => setImageIndex((value) => (value - 1 + imageCount) % imageCount);
  const next = () => setImageIndex((value) => (value + 1) % imageCount);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setImageIndex((value) => (value - 1 + imageCount) % imageCount);
      if (event.key === "ArrowRight") setImageIndex((value) => (value + 1) % imageCount);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [imageCount, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className="experience-layer project-brief" role="dialog" aria-modal="true" aria-label={`${project.title} project brief`}>
      <header className="project-brief-header">
        <button type="button" onClick={onClose}><ArrowLeft /> Back to selected projects</button>
        <a className="layer-wordmark" href="#top" onClick={onClose}>SARV</a>
        <button type="button" onClick={onClose} aria-label="Close project brief"><X /></button>
      </header>
      <div className="project-viewer">
        <div className="viewer-stage">
          {project.images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={image} alt={`${project.title}, view ${index + 1}`} className={index === imageIndex ? "active" : ""} />
          ))}
          <div className="viewer-caption"><span>{project.title}</span><span>{project.location}</span></div>
          <div className="viewer-controls">
            <button type="button" onClick={previous} aria-label="Previous project image"><ArrowLeft /></button>
            <span>{String(imageIndex + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}</span>
            <button type="button" onClick={next} aria-label="Next project image"><ArrowRight /></button>
          </div>
        </div>
        <div className="project-thumbnails">
          {project.images.map((image, index) => (
            <button key={image} type="button" className={index === imageIndex ? "active" : ""} onClick={() => setImageIndex(index)} aria-label={`View image ${index + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      </div>
      <section className="brief-content">
        <div className="brief-title">
          <p className="eyebrow brown">Selected project {project.index}</p>
          <h1>{project.title}</h1>
          <p>{project.concept}</p>
        </div>
        <dl className="brief-details">
          {[
            ["Project type", project.type],
            ["Approximate area", project.area],
            ["Design style", project.style],
            ["Scope", project.scope],
            ["Key materials", project.materials],
            ["Execution", project.execution],
            ["Client contact", "To be provided"],
            ["Owner contact", "Available on request"],
          ].map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}
        </dl>
        <div className="brief-palette" aria-label="Project palette">
          {project.palette.map((color) => <i key={color} style={{ background: color }} title={color} />)}
        </div>
      </section>
    </div>,
    document.body,
  );
}
