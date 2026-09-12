"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { CategoryId } from "@/data/projects";
import type { SelectedProject } from "@/data/selected-projects";
import { Hero } from "@/features/hero/Hero";
import { CategoryBrowser } from "@/features/categories/CategoryBrowser";
import { CategoryWorkspace } from "@/features/category-workspace/CategoryWorkspace";
import { SelectedProjects } from "@/features/selected-projects/SelectedProjects";
import { ProjectBrief } from "@/features/project-brief/ProjectBrief";
import { Studio } from "@/features/studio/Studio";

const navigation = [
  ["Work", "categories"],
  ["Selected", "selected-projects"],
  ["Studio", "studio"],
  ["Contact", "contact"],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [activeProject, setActiveProject] = useState<SelectedProject | null>(null);
  const overlayOpen = Boolean(activeCategory || activeProject);

  return (
    <main inert={overlayOpen ? true : undefined} aria-hidden={overlayOpen || undefined}>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="SARV home">SARV</a>
        <span className="header-note">Cabinetry &amp; architectural woodwork</span>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(([label, target]) => <a key={target} href={`#${target}`}>{label}</a>)}
        </nav>
        <button className="menu-trigger" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="mobile-menu-top"><span>SARV</span><button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button></div>
          <nav>{navigation.map(([label, target], index) => <a key={target} href={`#${target}`} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}</a>)}</nav>
          <small>Precision · Material · Craft</small>
        </div>
      )}

      <Hero />
      <CategoryBrowser onOpen={setActiveCategory} />
      <SelectedProjects onOpen={setActiveProject} />
      <Studio />
      <footer className="site-footer"><span>SARV</span><span>Cabinetry &amp; architectural woodwork</span><a href="#top">Back to top</a></footer>

      {activeCategory && (
        <CategoryWorkspace key={activeCategory} categoryId={activeCategory} onClose={() => setActiveCategory(null)} onChangeCategory={setActiveCategory} />
      )}
      {activeProject && <ProjectBrief key={activeProject.id} project={activeProject} onClose={() => setActiveProject(null)} />}
    </main>
  );
}
