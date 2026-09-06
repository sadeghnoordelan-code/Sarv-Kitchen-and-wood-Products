'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Menu, Plus, SlidersHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  categories,
  palettePresets,
  projects,
  selectedProjects,
  type BudgetTier,
  type CategoryId,
  type ProjectVisual,
  type SizeRange,
} from '@/data/projects';

type Filters = {
  style: string;
  palette: string;
  usage: string;
  size: '' | SizeRange;
  budgetTier: '' | BudgetTier;
};

type WebMCPTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: WebMCPTool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

const emptyFilters: Filters = {
  style: '',
  palette: '',
  usage: '',
  size: '',
  budgetTier: '',
};

const categoryMap = new Map(categories.map((category) => [category.id, category]));

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
};

const colorDistance = (a: string, b: string) => {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  return Math.hypot(ar[0] - br[0], ar[1] - br[1], ar[2] - br[2]);
};

const titleCase = (value: string) =>
  value.replace(/(^|[ -])\w/g, (letter) => letter.toUpperCase());

export function SarvExperience() {
  const heroStageRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const categoryStageRef = useRef<HTMLElement>(null);
  const categoryTrackRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('kitchen');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [customColors, setCustomColors] = useState(['#79573D', '#F4F1EB']);
  const [detailProject, setDetailProject] = useState<ProjectVisual | null>(null);

  const openCategory = (category: CategoryId) => {
    setActiveCategory(category);
    setFilters(emptyFilters);
    setWorkspaceOpen(true);
  };

  useEffect(() => {
    let frame = 0;
    let targetTime = 0;
    const video = heroVideoRef.current;
    const stage = heroStageRef.current;
    if (!video || !stage) return;

    const applyFrame = () => {
      frame = 0;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (Math.abs(video.currentTime - targetTime) > 0.006) {
        try { video.currentTime = targetTime; } catch { /* metadata is not ready */ }
      }
    };
    const readTarget = () => {
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / travel));
      const duration = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.04) : 0;
      targetTime = progress * duration;
      setScrolled(progress >= 0.995);
      if (!frame) frame = requestAnimationFrame(applyFrame);
    };
    const ready = () => {
      video.pause();
      readTarget();
      applyFrame();
    };
    video.addEventListener('loadedmetadata', ready);
    window.addEventListener('scroll', readTarget, { passive: true });
    window.addEventListener('resize', readTarget);
    readTarget();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      video.removeEventListener('loadedmetadata', ready);
      window.removeEventListener('scroll', readTarget);
      window.removeEventListener('resize', readTarget);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let current = 0;
    let target = 0;
    const stage = categoryStageRef.current;
    const track = categoryTrackRef.current;
    if (!stage || !track) return;

    const readTarget = () => {
      if (window.matchMedia('(max-width: 820px)').matches) return;
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / travel));
      const max = Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.08);
      target = progress * max;
    };
    const animate = () => {
      if (!window.matchMedia('(max-width: 820px)').matches) {
        current += (target - current) * 0.09;
        track.style.transform = `translate3d(${-current}px,0,0)`;
      } else {
        track.style.transform = '';
      }
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener('scroll', readTarget, { passive: true });
    window.addEventListener('resize', readTarget);
    readTarget();
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', readTarget);
      window.removeEventListener('resize', readTarget);
    };
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const validCategories = categories.map((category) => category.id);
    const tool: WebMCPTool = {
      name: 'configure_sarv_project_browser',
      title: 'Configure SARV project browser',
      description: 'Open a SARV category workspace and optionally configure its visual project filters.',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: validCategories },
          style: { type: 'string' },
          palette: { type: 'string' },
          usage: { type: 'string' },
          size: { type: 'string', enum: ['compact', 'medium', 'large'] },
          budgetTier: { type: 'string', enum: ['essential', 'premium', 'signature'] },
        },
        required: ['category'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!input || typeof input !== 'object') throw new Error('Input must be an object.');
        const value = input as Record<string, string>;
        if (!validCategories.includes(value.category as CategoryId)) throw new Error('Unknown SARV category.');
        const normalize = (entry?: string) => entry?.trim().toLowerCase() ?? '';
        const normalizePalette = (entry?: string) => normalize(entry).replace(/\s*\+\s*/g, '-').replace(/\s+/g, '-');
        setActiveCategory(value.category as CategoryId);
        setFilters({
          style: normalize(value.style), palette: normalizePalette(value.palette), usage: normalize(value.usage),
          size: normalize(value.size) as Filters['size'], budgetTier: normalize(value.budgetTier) as Filters['budgetTier'],
        });
        setWorkspaceOpen(true);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return { status: 'configured', category: value.category };
      },
    };
    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* Unsupported preview context. */ }
    return () => lifecycle.abort();
  }, []);

  const categoryProjects = useMemo(
    () => projects.filter((project) => project.category === activeCategory),
    [activeCategory],
  );

  const availableStyles = useMemo(
    () => [...new Set(categoryProjects.map((project) => project.style))],
    [categoryProjects],
  );
  const availablePalettes = useMemo(
    () => palettePresets.filter((preset) => categoryProjects.some((project) => project.palettes.includes(preset.id))),
    [categoryProjects],
  );
  const availableUsages = useMemo(
    () => [...new Set(categoryProjects.flatMap((project) => project.usage ? [project.usage] : []))],
    [categoryProjects],
  );
  const availableSizes = useMemo(
    () => [...new Set(categoryProjects.map((project) => project.size))],
    [categoryProjects],
  );
  const availableBudgets = useMemo(
    () => [...new Set(categoryProjects.map((project) => project.budgetTier))],
    [categoryProjects],
  );

  const { results, approximate } = useMemo(() => {
    const hasFilters = Object.values(filters).some(Boolean);
    const exact = categoryProjects.filter((project) =>
      (!filters.style || project.style === filters.style) &&
      (!filters.palette || filters.palette === 'custom' || project.palettes.includes(filters.palette)) &&
      (!filters.usage || project.usage === filters.usage) &&
      (!filters.size || project.size === filters.size) &&
      (!filters.budgetTier || project.budgetTier === filters.budgetTier),
    );
    if (exact.length && filters.palette !== 'custom') return { results: exact, approximate: false };
    if (!hasFilters) return { results: categoryProjects, approximate: false };

    const customScore = (project: ProjectVisual) => customColors.reduce((score, color) => {
      const best = Math.min(...project.paletteColors.map((projectColor) => colorDistance(color, projectColor)));
      return score + Math.max(0, 2.5 - best / 120);
    }, 0);
    const scored = categoryProjects.map((project) => {
      let score = filters.palette === 'custom' ? customScore(project) : 0;
      if (filters.style && project.style === filters.style) score += 3;
      if (filters.palette && project.palettes.includes(filters.palette)) score += 3;
      if (filters.usage && project.usage === filters.usage) score += 3;
      if (filters.size && project.size === filters.size) score += 2;
      if (filters.budgetTier && project.budgetTier === filters.budgetTier) score += 2;
      return { project, score };
    }).sort((a, b) => b.score - a.score);
    return { results: scored.slice(0, Math.min(3, scored.length)).map((item) => item.project), approximate: true };
  }, [categoryProjects, customColors, filters]);

  const setFilter = <Key extends keyof Filters>(key: Key, value: Filters[Key]) => {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? '' : value }));
  };

  const updateColor = (index: number, value: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    setCustomColors((current) => current.map((color, colorIndex) => colorIndex === index ? value.toUpperCase() : color));
  };

  const activeCategoryData = categoryMap.get(activeCategory)!;

  return (
    <main className="sarv-shell">
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="wordmark" href="#top" aria-label="SARV home">SARV</a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a><a href="#selected">Projects</a><a href="#approach">Approach</a>
        </nav>
        <a className="header-cta" href="#contact">Start a project <ArrowUpRight aria-hidden="true" /></a>
        <button className="menu-toggle" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
        <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
        <a href="#selected" onClick={() => setMenuOpen(false)}>Projects</a>
        <a href="#approach" onClick={() => setMenuOpen(false)}>Approach</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </div>

      <section ref={heroStageRef} className="hero-stage" id="top">
        <div className="hero">
          <video ref={heroVideoRef} className="hero-image" muted playsInline preload="auto" disablePictureInPicture tabIndex={-1} aria-label="Scroll-controlled SARV architectural interior film">
            <source src="/sarv/hero/sarv-hero-sequence.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="section-kicker">SARV / Architectural joinery</p>
        <h2 id="manifesto-title">We design woodwork as part of the <i>space</i>—not as an object added afterwards.</h2>
        <div className="manifesto-meta"><span>Design</span><span>Material</span><span>Production</span><span>Installation</span></div>
      </section>

      <section ref={categoryStageRef} className="category-stage" id="work" aria-labelledby="category-title">
        <div className="category-sticky">
          <div className="category-heading"><p className="section-kicker">Fields of work / 01—06</p><h2 id="category-title">Move through<br /><i>the work.</i></h2></div>
          <div ref={categoryTrackRef} className="category-track">
            {categories.map((category) => (
              <button className="category-panel" type="button" key={category.id} onClick={() => openCategory(category.id)} aria-label={`Explore ${category.label} projects`}>
                <Image src={category.image} alt="" fill sizes="(max-width: 820px) 82vw, 47vw" />
                <span className="category-shade" />
                <span className="category-index">{category.index}</span>
                <span className="category-copy"><strong>{category.label}</strong><small>{category.descriptor}</small></span>
                <span className="category-open">Explore <ArrowUpRight /></span>
              </button>
            ))}
            <div className="category-end"><span>SARV</span><p>Six disciplines.<br />One architectural language.</p><a href="#selected">Selected projects</a></div>
          </div>
        </div>
      </section>

      <section className="selected-projects" id="selected" aria-labelledby="selected-title">
        <header><p className="section-kicker">Selected projects / 03</p><h2 id="selected-title">A closer look at <i>precision.</i></h2></header>
        {selectedProjects.map((project, index) => (
          <button key={project.id} type="button" className={`feature-project feature-${index + 1}`} onClick={() => setDetailProject(project)}>
            <span className="feature-image"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 820px) 100vw, 72vw" /></span>
            <span className="feature-number">0{index + 1}</span>
            <span className="feature-copy"><small>{categoryMap.get(project.category)?.label} · {titleCase(project.style)}</small><strong>{project.name}</strong><em>View project <ArrowUpRight /></em></span>
          </button>
        ))}
      </section>

      <section className="material-story" aria-labelledby="materials-title">
        <div className="material-intro"><p className="section-kicker">Material intelligence</p><h2 id="materials-title">Quality lives at the <i>junction.</i></h2><p>Grain continuity, edge treatment, hardware and light are resolved together—because the smallest line changes the whole room.</p></div>
        <figure className="material-large"><Image src="/sarv/details/atelier-detail.png" alt="Close detail of walnut cabinetry, stone and integrated light" fill sizes="60vw" /><figcaption><span>01</span> Walnut / stone / light</figcaption></figure>
        <figure className="material-small"><Image src="/sarv/details/ridge-detail.png" alt="Fluted glass and dark walnut wardrobe hardware detail" fill sizes="40vw" /><figcaption><span>02</span> Glass / hinge / reveal</figcaption></figure>
        <div className="material-swatches" aria-label="Core material palette"><span style={{ background: '#7A543B' }}>Walnut</span><span style={{ background: '#B28B64' }}>Oak</span><span style={{ background: '#D7CAB9' }}>Stone</span><span style={{ background: '#252525' }}>Metal</span></div>
      </section>

      <section className="approach" id="approach" aria-labelledby="approach-title">
        <div className="approach-copy"><p className="section-kicker">About SARV</p><h2 id="approach-title">From first line<br />to final <i>alignment.</i></h2><p>Design, material selection, custom production and installation are treated as one continuous responsibility.</p></div>
        <ol className="process-list">
          {[
            ['01', 'Discover', 'Read the space, routines and architectural constraints.'],
            ['02', 'Design', 'Resolve proportion, storage logic and every visible junction.'],
            ['03', 'Material', 'Match veneer, finish, hardware and stone with intent.'],
            ['04', 'Produce', 'Fabricate, finish and assemble under controlled conditions.'],
            ['05', 'Install', 'Set, align and complete the work within the architecture.'],
          ].map(([number, title, text]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{text}</p></li>)}
        </ol>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <p className="section-kicker">Begin a conversation</p>
        <h2 id="contact-title">Let’s build something <i>precise.</i></h2>
        <div className="contact-row"><a href="mailto:hello@sarv.example">Start a project <ArrowUpRight /></a><p>Project contact details will be added here.<br />No location or business information has been assumed.</p></div>
        <footer><span>SARV</span><span>Architectural woodwork · Custom interiors</span><a href="#top">Back to top ↑</a></footer>
      </section>

      <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <DialogContent className="category-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">{activeCategoryData.label} project workspace</DialogTitle>
          <DialogDescription className="sr-only">Browse and filter SARV {activeCategoryData.label.toLowerCase()} projects.</DialogDescription>
          <header className="workspace-header"><button type="button" onClick={() => setWorkspaceOpen(false)}><ArrowLeft /> Back to work</button><span>SARV / PROJECT BROWSER</span><button type="button" onClick={() => setWorkspaceOpen(false)} aria-label="Close workspace"><X /></button></header>
          <div className="workspace-tabs" role="tablist" aria-label="Project category">
            {categories.map((category) => <button key={category.id} role="tab" aria-selected={activeCategory === category.id} onClick={() => { setActiveCategory(category.id); setFilters(emptyFilters); }}>{category.shortLabel}</button>)}
          </div>
          <div className="workspace-body">
            <aside className="filter-panel">
              <div className="filter-title"><SlidersHorizontal /><span>Refine</span><button type="button" onClick={() => setFilters(emptyFilters)}>Clear all</button></div>
              <FilterGroup label="Style" values={availableStyles} value={filters.style} onChange={(value) => setFilter('style', value)} />
              <div className="filter-group"><span className="filter-label">Palette</span><div className="palette-options">
                {availablePalettes.map((preset) => <button type="button" key={preset.id} className={filters.palette === preset.id ? 'is-active' : ''} onClick={() => setFilter('palette', preset.id)}><span className="duo-swatch">{preset.colors.map((color) => <i key={color} style={{ background: color }} />)}</span>{preset.label}</button>)}
                <button type="button" className={filters.palette === 'custom' ? 'is-active' : ''} onClick={() => setFilter('palette', 'custom')}><span className="custom-swatch">+</span>Custom palette</button>
              </div></div>
              {filters.palette === 'custom' && <div className="custom-palette"><div className="custom-palette-bar">{customColors.map((color) => <i key={color} style={{ background: color }} />)}</div>{customColors.map((color, index) => { const rgb = hexToRgb(color); return <div className="color-row" key={`${index}-${color}`}><input type="color" value={color} onChange={(event) => updateColor(index, event.target.value)} aria-label={`Custom color ${index + 1}`} /><input value={color} onChange={(event) => updateColor(index, event.target.value)} aria-label={`HEX value ${index + 1}`} /><span>RGB {rgb.join(' · ')}</span>{customColors.length > 1 && <button type="button" onClick={() => setCustomColors((current) => current.filter((_, currentIndex) => currentIndex !== index))} aria-label={`Remove color ${index + 1}`}><X /></button>}</div>; })}{customColors.length < 4 && <button className="add-color" type="button" onClick={() => setCustomColors((current) => [...current, '#D9D9D9'])}><Plus /> Add color</button>}</div>}
              {availableUsages.length > 0 && <FilterGroup label="Usage" values={availableUsages} value={filters.usage} onChange={(value) => setFilter('usage', value)} />}
              <FilterGroup label="Size" values={availableSizes} value={filters.size} onChange={(value) => setFilter('size', value as SizeRange)} />
              <FilterGroup label="Budget classification" values={availableBudgets} value={filters.budgetTier} onChange={(value) => setFilter('budgetTier', value as BudgetTier)} />
            </aside>
            <section className="result-panel" aria-live="polite">
              <div className="result-heading"><div><span>{activeCategoryData.index} / {activeCategoryData.label}</span><h3>{activeCategoryData.descriptor}</h3></div><strong>{results.length.toString().padStart(2, '0')} projects</strong></div>
              {approximate && <p className="nearest-note">No exact match. Showing the closest SARV projects.</p>}
              <div className="result-grid">{results.map((project) => <button key={project.id} type="button" className="result-card" onClick={() => setDetailProject(project)}><span><Image src={project.image} alt={project.alt} fill sizes="(max-width: 820px) 92vw, 35vw" /></span><div><small>{titleCase(project.style)} · {titleCase(project.size)}</small><strong>{project.name}</strong><em>View <ArrowUpRight /></em></div></button>)}</div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(detailProject)} onOpenChange={(open) => { if (!open) setDetailProject(null); }}>
        <SheetContent className="project-sheet" side="right" showCloseButton={false}>
          {detailProject && <>
            <header className="project-sheet-header"><button type="button" onClick={() => setDetailProject(null)}><ArrowLeft /> Close project</button><span>SARV / {categoryMap.get(detailProject.category)?.label}</span></header>
            <div className="project-detail-hero"><Image src={detailProject.image} alt={detailProject.alt} fill sizes="100vw" /><div><small>{titleCase(detailProject.style)} · {titleCase(detailProject.budgetTier)} classification</small><SheetTitle>{detailProject.name}</SheetTitle></div></div>
            <SheetDescription className="project-summary">{detailProject.statement}</SheetDescription>
            <div className="project-spec"><div><span>Category</span><strong>{categoryMap.get(detailProject.category)?.label}</strong></div><div><span>Scale</span><strong>{titleCase(detailProject.size)}</strong></div><div><span>Materials</span><strong>{detailProject.materials.join(' · ')}</strong></div></div>
            {detailProject.gallery && <div className="project-gallery">{detailProject.gallery.slice(1).map((image, index) => <figure key={image}><Image src={image} alt={`${detailProject.name} ${index === 0 ? 'alternate architectural view' : 'joinery detail'}`} fill sizes="(max-width: 820px) 100vw, 50vw" /></figure>)}</div>}
          </>}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function FilterGroup({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="filter-group"><span className="filter-label">{label}</span><div className="chip-row">{values.map((item) => <button key={item} type="button" className={value === item ? 'is-active' : ''} onClick={() => onChange(item)}>{titleCase(item)}</button>)}</div></div>;
}
