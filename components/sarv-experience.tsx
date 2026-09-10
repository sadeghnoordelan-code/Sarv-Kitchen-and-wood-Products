'use client';

import Image from 'next/image';
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Plus, SlidersHorizontal, X } from 'lucide-react';
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
const fieldTaglines: Record<CategoryId, string> = {
  kitchen: 'Shaped around life',
  wardrobe: 'Quietly composed',
  doors: 'Defining thresholds',
  skirting: 'Lines that resolve',
  'tv-console': 'Calibrated living',
  'bathroom-vanity': 'Made for ritual',
};
const fieldObjectPositions: Record<CategoryId, string> = {
  kitchen: '52% 50%',
  wardrobe: '62% 50%',
  doors: '50% 50%',
  skirting: '32% 58%',
  'tv-console': '50% 48%',
  'bathroom-vanity': '43% 52%',
};

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
  const workspaceBodyRef = useRef<HTMLDivElement>(null);
  const workspaceTabsRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLElement>(null);
  const resultPanelRef = useRef<HTMLElement>(null);
  const workspaceLayerRef = useRef<HTMLDialogElement>(null);
  const workspaceReturnFocusRef = useRef<HTMLElement | null>(null);
  const detailFromWorkspaceRef = useRef(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceMounted, setWorkspaceMounted] = useState(false);
  const [workspaceVisible, setWorkspaceVisible] = useState(false);
  const [workspaceSettled, setWorkspaceSettled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('kitchen');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [customColors, setCustomColors] = useState(['#79573D', '#F4F1EB']);
  const [detailProject, setDetailProject] = useState<ProjectVisual | null>(
    null,
  );

  const resetWorkspaceScroll = () => {
    requestAnimationFrame(() => {
      workspaceBodyRef.current?.scrollTo({ top: 0 });
      filterPanelRef.current?.scrollTo({ top: 0 });
      resultPanelRef.current?.scrollTo({ top: 0 });
    });
  };

  const selectWorkspaceCategory = (category: CategoryId) => {
    setActiveCategory(category);
    setFilters(emptyFilters);
    resetWorkspaceScroll();
  };

  const openCategory = (category: CategoryId) => {
    workspaceReturnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    selectWorkspaceCategory(category);
    setWorkspaceOpen(true);
  };

  const goToField = (index: number) => {
    const stage = categoryStageRef.current;
    if (!stage) return;
    const boundedIndex = Math.min(categories.length - 1, Math.max(0, index));
    const stageTop = window.scrollY + stage.getBoundingClientRect().top;
    const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: stageTop + travel * (boundedIndex / (categories.length - 1)),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  const openProject = (project: ProjectVisual, fromWorkspace = false) => {
    detailFromWorkspaceRef.current = fromWorkspace;
    if (fromWorkspace) setWorkspaceOpen(false);
    setDetailProject(project);
  };

  const closeProject = () => {
    const returnToWorkspace = detailFromWorkspaceRef.current;
    detailFromWorkspaceRef.current = false;
    setDetailProject(null);
    if (returnToWorkspace) setWorkspaceOpen(true);
  };

  const handleCategoryTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % categories.length;
    if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + categories.length) % categories.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = categories.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextCategory = categories[nextIndex];
    selectWorkspaceCategory(nextCategory.id);
    requestAnimationFrame(() => {
      document.getElementById(`category-tab-${nextCategory.id}`)?.focus();
    });
  };

  useEffect(() => {
    if (!workspaceOpen) return;
    const frame = requestAnimationFrame(() => {
      const tabs = workspaceTabsRef.current;
      const activeTab = tabs?.querySelector<HTMLElement>(
        `#category-tab-${activeCategory}`,
      );
      if (!tabs || !activeTab) return;
      const left =
        activeTab.offsetLeft - (tabs.clientWidth - activeTab.offsetWidth) / 2;
      tabs.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCategory, workspaceOpen]);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let lifecycleTimer: ReturnType<typeof setTimeout> | undefined;

    if (workspaceOpen) {
      firstFrame = requestAnimationFrame(() => {
        setWorkspaceMounted(true);
        setWorkspaceSettled(false);
        secondFrame = requestAnimationFrame(() =>
          setWorkspaceVisible(true),
        );
      });
      lifecycleTimer = setTimeout(() => setWorkspaceSettled(true), 380);
    } else {
      firstFrame = requestAnimationFrame(() => {
        setWorkspaceSettled(false);
        setWorkspaceVisible(false);
      });
      lifecycleTimer = setTimeout(() => setWorkspaceMounted(false), 380);
    }

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (lifecycleTimer) clearTimeout(lifecycleTimer);
    };
  }, [workspaceOpen]);

  useEffect(() => {
    if (!workspaceMounted) return;

    const root = document.documentElement;
    const body = document.body;
    const rootOverflow = root.style.overflow;
    const rootOverscroll = root.style.overscrollBehavior;
    const bodyOverflow = body.style.overflow;
    const bodyOverscroll = body.style.overscrollBehavior;
    const focusFrame = requestAnimationFrame(() => {
      workspaceLayerRef.current
        ?.querySelector<HTMLElement>('[data-workspace-initial-focus]')
        ?.focus();
    });

    root.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';

    const handleWorkspaceKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setWorkspaceOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        workspaceLayerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.offsetParent !== null,
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleWorkspaceKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleWorkspaceKeyDown);
      root.style.overflow = rootOverflow;
      root.style.overscrollBehavior = rootOverscroll;
      body.style.overflow = bodyOverflow;
      body.style.overscrollBehavior = bodyOverscroll;
      if (!detailFromWorkspaceRef.current) {
        workspaceReturnFocusRef.current?.focus({ preventScroll: true });
      }
    };
  }, [workspaceMounted]);

  useEffect(() => {
    const frameDuration = 1 / 24;
    let animationFrame = 0;
    let stageStart = 0;
    let travel = 1;
    let targetTime = 0;
    let ready = false;
    let seekInFlight = false;
    const video = heroVideoRef.current;
    const stage = heroStageRef.current;
    const hero = video?.parentElement;
    if (!video || !stage || !hero) return;

    const seekToLatestFrame = () => {
      if (!ready || seekInFlight || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (Math.abs(video.currentTime - targetTime) < frameDuration * 0.45) return;
      try {
        seekInFlight = true;
        video.currentTime = targetTime;
      } catch {
        seekInFlight = false;
      }
    };

    const updateGeometry = () => {
      stageStart = window.scrollY + stage.getBoundingClientRect().top;
      travel = Math.max(1, stage.offsetHeight - hero.clientHeight);
    };

    const updateFromScroll = () => {
      animationFrame = 0;
      const progress = Math.min(1, Math.max(0, (window.scrollY - stageStart) / travel));
      const lastFrameTime = Number.isFinite(video.duration)
        ? Math.max(0, video.duration - frameDuration)
        : 0;
      const requestedFrame = Math.round((progress * lastFrameTime) / frameDuration);
      targetTime = Math.min(lastFrameTime, requestedFrame * frameDuration);
      stage.style.setProperty('--hero-progress', progress.toFixed(4));
      setScrolled(progress >= 0.995);
      seekToLatestFrame();
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateFromScroll);
    };

    const handleReady = () => {
      ready = true;
      video.pause();
      updateGeometry();
      scheduleUpdate();
    };

    const handleSeeked = () => {
      seekInFlight = false;
      seekToLatestFrame();
    };

    const handleResize = () => {
      updateGeometry();
      scheduleUpdate();
    };

    video.pause();
    video.addEventListener('loadeddata', handleReady);
    video.addEventListener('seeked', handleSeeked);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', handleResize);
    updateGeometry();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) handleReady();
    else scheduleUpdate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', handleResize);
      stage.style.removeProperty('--hero-progress');
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let current = 0;
    let target = 0;
    let initialized = false;
    let lastIndex = -1;
    const stage = categoryStageRef.current;
    const track = categoryTrackRef.current;
    if (!stage || !track) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const slides = Array.from(track.querySelectorAll<HTMLElement>('.category-slide')).map((slide) => ({
      slide,
      image: slide.querySelector<HTMLElement>('.category-hero-image'),
      panel: slide.querySelector<HTMLElement>('.category-color-panel'),
      copy: slide.querySelector<HTMLElement>('.category-panel-copy'),
      info: slide.querySelector<HTMLElement>('.category-info-card'),
      specimen: slide.querySelector<HTMLElement>('.category-specimen'),
    }));

    const readTarget = () => {
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / travel));
      target = progress * (categories.length - 1);
      if (!initialized) {
        current = target;
        initialized = true;
      }
    };

    const animate = () => {
      frame = 0;
      current = reduceMotion.matches ? Math.round(target) : target;

      const overallProgress = current / Math.max(1, categories.length - 1);
      const lowerIndex = Math.floor(current);
      const upperIndex = Math.ceil(current);
      track.style.setProperty('--category-progress', overallProgress.toFixed(4));
      slides.forEach(({ slide, image, panel, copy, info, specimen }, index) => {
        const rawReveal = Math.min(1, Math.max(0, current - index + 1));
        const stagedReveal = Math.min(1, Math.max(0, (rawReveal - 0.1) / 0.8));
        const reveal = 1 - Math.pow(1 - stagedReveal, 3);
        const entrance = 1 - reveal;
        const topEdge = Math.max(0, 100 - reveal * 100);
        const bottomEdge = Math.max(0, 100 - Math.min(1, reveal * 1.22) * 100);
        const isVisible = index === lowerIndex || index === upperIndex;
        const isTransitioning = isVisible && lowerIndex !== upperIndex;
        slide.style.visibility = isVisible ? 'visible' : 'hidden';
        slide.style.opacity = Math.min(1, reveal * 1.7).toFixed(3);
        slide.style.willChange = isTransitioning ? 'clip-path, opacity' : 'auto';
        slide.style.clipPath = index === 0
          ? 'inset(0)'
          : `polygon(${topEdge}% 0,100% 0,100% 100%,${bottomEdge}% 100%)`;
        if (image) {
          image.style.transform = `translate3d(${entrance * 4}%,0,0) scale(1.035)`;
          image.style.willChange = isTransitioning ? 'transform' : 'auto';
        }
        if (panel) {
          const direction = index % 2 ? -1 : 1;
          const panelReveal = Math.min(1, Math.max(0, (reveal - 0.05) / 0.68));
          panel.style.opacity = panelReveal.toFixed(3);
          panel.style.transform = `translate3d(${direction * (1 - panelReveal) * 46}%,${(1 - panelReveal) * 8}%,0)`;
          panel.style.willChange = isTransitioning ? 'opacity, transform' : 'auto';
        }
        if (copy) {
          const copyReveal = Math.min(1, Math.max(0, (reveal - 0.24) / 0.56));
          copy.style.opacity = copyReveal.toFixed(3);
          copy.style.transform = `translate3d(0,${(1 - copyReveal) * 1.15}rem,0)`;
          copy.style.willChange = isTransitioning ? 'opacity, transform' : 'auto';
        }
        if (info) {
          const infoReveal = Math.min(1, Math.max(0, (reveal - 0.28) / 0.52));
          info.style.opacity = infoReveal.toFixed(3);
          info.style.transform = `translate3d(0,${(1 - infoReveal) * 2.5}rem,0)`;
          info.style.willChange = isTransitioning ? 'opacity, transform' : 'auto';
        }
        if (specimen) {
          const direction = index % 2 ? 1 : -1;
          const specimenReveal = Math.min(1, Math.max(0, (reveal - 0.18) / 0.66));
          specimen.style.opacity = specimenReveal.toFixed(3);
          specimen.style.transform = `translate3d(${direction * (1 - specimenReveal) * 62}%,0,0) rotate(${direction * (1 - specimenReveal) * 3}deg)`;
          specimen.style.willChange = isTransitioning ? 'opacity, transform' : 'auto';
        }
      });

      const nextIndex = Math.min(categories.length - 1, Math.max(0, Math.round(current)));
      if (nextIndex !== lastIndex) {
        lastIndex = nextIndex;
        setFieldIndex(nextIndex);
      }
    };

    const scheduleUpdate = () => {
      readTarget();
      if (!frame) frame = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    reduceMotion.addEventListener('change', scheduleUpdate);
    scheduleUpdate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      reduceMotion.removeEventListener('change', scheduleUpdate);
      track.style.removeProperty('--category-progress');
      slides.forEach(({ slide, image, panel, copy, info, specimen }) => {
        slide.style.removeProperty('visibility');
        slide.style.removeProperty('clip-path');
        slide.style.removeProperty('opacity');
        slide.style.removeProperty('will-change');
        image?.style.removeProperty('transform');
        image?.style.removeProperty('will-change');
        panel?.style.removeProperty('opacity');
        panel?.style.removeProperty('transform');
        panel?.style.removeProperty('will-change');
        copy?.style.removeProperty('opacity');
        copy?.style.removeProperty('transform');
        copy?.style.removeProperty('will-change');
        info?.style.removeProperty('opacity');
        info?.style.removeProperty('transform');
        info?.style.removeProperty('will-change');
        specimen?.style.removeProperty('opacity');
        specimen?.style.removeProperty('transform');
        specimen?.style.removeProperty('will-change');
      });
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
    if (!hasFilters) return { results: categoryProjects, approximate: false };

    const compatible = categoryProjects.filter(
      (project) =>
        (!filters.style || project.style === filters.style) &&
        (!filters.usage || project.usage === filters.usage) &&
        (!filters.size || project.size === filters.size) &&
        (!filters.budgetTier || project.budgetTier === filters.budgetTier),
    );

    if (filters.palette !== 'custom') {
      const exact = compatible.filter(
        (project) =>
          !filters.palette || project.palettes.includes(filters.palette),
      );
      return { results: exact, approximate: false };
    }

    if (!compatible.length) return { results: [], approximate: false };

    const customScore = (project: ProjectVisual) =>
      customColors.reduce((score, color) => {
        const best = Math.min(
          ...project.paletteColors.map((projectColor) =>
            colorDistance(color, projectColor),
          ),
        );
        return score + Math.max(0, 2.5 - best / 120);
      }, 0);
    const scored = compatible
      .map((project) => ({ project, score: customScore(project) }))
      .sort((a, b) => b.score - a.score);
    return {
      results: scored
        .slice(0, Math.min(3, scored.length))
        .map((item) => item.project),
      approximate: true,
    };
  }, [categoryProjects, customColors, filters]);

  const setFilter = <Key extends keyof Filters>(
    key: Key,
    value: Filters[Key],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? '' : value,
    }));
    requestAnimationFrame(() => resultPanelRef.current?.scrollTo({ top: 0 }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    requestAnimationFrame(() => resultPanelRef.current?.scrollTo({ top: 0 }));
  };

  const updateColor = (index: number, value: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(value)) return;
    setCustomColors((current) =>
      current.map((color, colorIndex) =>
        colorIndex === index ? value.toUpperCase() : color,
      ),
    );
  };

  const activeCategoryData = categoryMap.get(activeCategory)!;

  return (
    <main
      className={`sarv-shell ${workspaceSettled ? 'is-workspace-obscured' : ''}`}
      aria-hidden={workspaceMounted || undefined}
      inert={workspaceMounted ? true : undefined}
    >
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
          <div className="hero-copy">
            <p className="hero-brand">SARV</p>
            <div className="hero-statement">
              <p>Architectural woodwork</p>
              <h1>Made for the <i>space.</i></h1>
            </div>
            <div className="hero-meta">
              <span>Custom interiors · Precision joinery</span>
              <span>Scroll to move through the film</span>
            </div>
          </div>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="section-kicker">SARV / Architectural joinery</p>
        <h2 id="manifesto-title">We design woodwork as part of the <i>space</i>—not as an object added afterwards.</h2>
        <div className="manifesto-meta"><span>Design</span><span>Material</span><span>Production</span><span>Installation</span></div>
      </section>

      <section ref={categoryStageRef} className="category-stage" id="work" aria-labelledby="category-title">
        <div className="category-sticky">
          <div ref={categoryTrackRef} className="category-showcase">
            <p className="category-heading" id="category-title"><span>Fields of work</span> 01—06</p>
            <fieldset className="category-controls" aria-label="Choose a field of work">
              <button type="button" disabled={fieldIndex === 0} onClick={() => goToField(fieldIndex - 1)} aria-label="Previous field"><ArrowLeft /></button>
              <span aria-live="polite" aria-atomic="true">{categories[fieldIndex].index} / 06</span>
              <button type="button" disabled={fieldIndex === categories.length - 1} onClick={() => goToField(fieldIndex + 1)} aria-label="Next field"><ArrowRight /></button>
            </fieldset>
            {categories.map((category, index) => (
              <article className={`category-slide ${index % 2 ? 'is-reverse' : ''}`} data-category={category.id} key={category.id} style={{ zIndex: index + 1 }} aria-hidden={fieldIndex !== index}>
                <div className="category-media">
                  <Image className="category-hero-image" src={category.image} alt={`${category.label} architectural woodwork`} fill priority={index === 0} sizes="100vw" style={{ objectPosition: fieldObjectPositions[category.id] }} />
                  <span className="category-wash" />
                </div>
                <div className="category-color-panel">
                  <div className="category-panel-copy">
                    <small>Field / {category.index}</small>
                    <h2>{category.label}</h2>
                    <strong>{fieldTaglines[category.id]}</strong>
                    <button type="button" tabIndex={fieldIndex === index ? 0 : -1} onClick={() => openCategory(category.id)}>Explore projects <ArrowUpRight /></button>
                  </div>
                </div>
                <div className="category-info-card">
                  <span>{projects.filter((project) => project.category === category.id).length.toString().padStart(2, '0')} projects</span>
                  <p>{category.descriptor}</p>
                </div>
                <div className="category-specimen" aria-hidden="true"><Image src={category.image} alt="" fill sizes="18vw" style={{ objectPosition: fieldObjectPositions[category.id] }} /></div>
              </article>
            ))}
            <div className="category-progress" aria-hidden="true"><i /></div>
            <p className="category-scroll-hint">Scroll to move through the fields</p>
          </div>
        </div>
      </section>

      <section className="selected-projects" id="selected" aria-labelledby="selected-title">
        <header><p className="section-kicker">Selected projects / 03</p><h2 id="selected-title">A closer look at <i>precision.</i></h2></header>
        {selectedProjects.map((project, index) => (
          <button key={project.id} type="button" className={`feature-project feature-${index + 1}`} onClick={() => openProject(project)}>
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

      {workspaceMounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <dialog
            open
            ref={workspaceLayerRef}
            className={`category-workspace-layer ${workspaceVisible ? 'is-visible' : ''}`}
            aria-modal="true"
            aria-labelledby="category-workspace-title"
            aria-describedby="category-workspace-description"
          >
          <h2 className="sr-only" id="category-workspace-title">
            {activeCategoryData.label} project workspace
          </h2>
          <p className="sr-only" id="category-workspace-description">
            Browse and filter SARV {activeCategoryData.label.toLowerCase()}{' '}
            projects.
          </p>
          <header className="workspace-header">
            <button
              type="button"
              data-workspace-initial-focus
              onClick={() => setWorkspaceOpen(false)}
            >
              <ArrowLeft /> Back to work
            </button>
            <span>SARV / PROJECT BROWSER</span>
            <button
              type="button"
              onClick={() => setWorkspaceOpen(false)}
              aria-label="Close workspace"
            >
              <X />
            </button>
          </header>
          <div
            ref={workspaceTabsRef}
            className="workspace-tabs"
            role="tablist"
            aria-label="Project category"
          >
            {categories.map((category, index) => (
              <button
                key={category.id}
                id={`category-tab-${category.id}`}
                role="tab"
                aria-controls="workspace-results"
                aria-selected={activeCategory === category.id}
                tabIndex={activeCategory === category.id ? 0 : -1}
                onClick={() => selectWorkspaceCategory(category.id)}
                onKeyDown={(event) => handleCategoryTabKeyDown(event, index)}
              >
                {category.shortLabel}
              </button>
            ))}
          </div>
          <div ref={workspaceBodyRef} className="workspace-body">
            <aside ref={filterPanelRef} className="filter-panel">
              <div className="filter-title">
                <SlidersHorizontal />
                <span>Refine</span>
                <button type="button" onClick={clearFilters}>
                  Clear all
                </button>
              </div>
              <FilterGroup
                label="Style"
                values={availableStyles}
                value={filters.style}
                onChange={(value) => setFilter('style', value)}
              />
              <div className="filter-group">
                <span className="filter-label">Palette</span>
                <div className="palette-options">
                  {availablePalettes.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      aria-pressed={filters.palette === preset.id}
                      className={
                        filters.palette === preset.id ? 'is-active' : ''
                      }
                      onClick={() => setFilter('palette', preset.id)}
                    >
                      <span className="duo-swatch">
                        {preset.colors.map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </span>
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={filters.palette === 'custom'}
                    className={filters.palette === 'custom' ? 'is-active' : ''}
                    onClick={() => setFilter('palette', 'custom')}
                  >
                    <span className="custom-swatch">+</span>Custom palette
                  </button>
                </div>
              </div>
              {filters.palette === 'custom' && (
                <div className="custom-palette">
                  <div className="custom-palette-bar">
                    {customColors.map((color, index) => (
                      <i
                        key={`swatch-${index}`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                  {customColors.map((color, index) => {
                    const rgb = hexToRgb(color);
                    return (
                      <div className="color-row" key={`color-${index}`}>
                        <input
                          type="color"
                          value={color}
                          onChange={(event) =>
                            updateColor(index, event.target.value)
                          }
                          aria-label={`Custom color ${index + 1}`}
                        />
                        <HexInput
                          key={color}
                          value={color}
                          label={`HEX value ${index + 1}`}
                          onCommit={(value) => updateColor(index, value)}
                        />
                        <span>RGB {rgb.join(' · ')}</span>
                        {customColors.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setCustomColors((current) =>
                                current.filter(
                                  (_, currentIndex) => currentIndex !== index,
                                ),
                              )
                            }
                            aria-label={`Remove color ${index + 1}`}
                          >
                            <X />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {customColors.length < 4 && (
                    <button
                      className="add-color"
                      type="button"
                      onClick={() =>
                        setCustomColors((current) => [...current, '#D9D9D9'])
                      }
                    >
                      <Plus /> Add color
                    </button>
                  )}
                </div>
              )}
              {availableUsages.length > 0 && (
                <FilterGroup
                  label="Usage"
                  values={availableUsages}
                  value={filters.usage}
                  onChange={(value) => setFilter('usage', value)}
                />
              )}
              <FilterGroup
                label="Size"
                values={availableSizes}
                value={filters.size}
                onChange={(value) => setFilter('size', value as SizeRange)}
              />
              <FilterGroup
                label="Budget classification"
                values={availableBudgets}
                value={filters.budgetTier}
                onChange={(value) =>
                  setFilter('budgetTier', value as BudgetTier)
                }
              />
              <button
                className="filter-results-action"
                type="button"
                disabled={!results.length}
                aria-controls="workspace-results"
                onClick={() =>
                  resultPanelRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
              >
                {results.length ? (
                  <>
                    View {results.length.toString().padStart(2, '0')}{' '}
                    {results.length === 1 ? 'project' : 'projects'}{' '}
                    <ArrowDown />
                  </>
                ) : (
                  'No exact matches'
                )}
              </button>
            </aside>
            <section
              ref={resultPanelRef}
              className="result-panel"
              id="workspace-results"
              role="tabpanel"
              aria-labelledby={`category-tab-${activeCategory}`}
              aria-live="polite"
            >
              <div className="result-heading">
                <div>
                  <span>
                    {activeCategoryData.index} / {activeCategoryData.label}
                  </span>
                  <h3>{activeCategoryData.descriptor}</h3>
                </div>
                <strong>
                  {results.length.toString().padStart(2, '0')} projects
                </strong>
              </div>
              {approximate && (
                <p className="nearest-note">
                  Closest palette matches within your other filters.
                </p>
              )}
              {results.length ? (
                <div className="result-grid">
                  {results.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className="result-card"
                      onClick={() => openProject(project, true)}
                    >
                      <span>
                        <Image
                          src={project.image}
                          alt={project.alt}
                          fill
                          sizes="(max-width: 820px) 92vw, 35vw"
                        />
                      </span>
                      <div>
                        <small>
                          {titleCase(project.style)} · {titleCase(project.size)}
                        </small>
                        <strong>{project.name}</strong>
                        <em>
                          View <ArrowUpRight />
                        </em>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-results">
                  <span>Nothing matches every selected filter.</span>
                  <p>
                    Adjust one choice or reset the filters to see this field of
                    work again.
                  </p>
                  <button type="button" onClick={clearFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </section>
          </div>
          </dialog>,
          document.body,
        )}

      <Sheet
        open={Boolean(detailProject)}
        onOpenChange={(open) => {
          if (!open) closeProject();
        }}
      >
        <SheetContent
          className="project-sheet"
          side="right"
          showCloseButton={false}
        >
          {detailProject && (
            <>
              <header className="project-sheet-header">
                <button type="button" onClick={closeProject}>
                  <ArrowLeft /> Close project
                </button>
                <span>
                  SARV / {categoryMap.get(detailProject.category)?.label}
                </span>
              </header>
              <div className="project-detail-hero">
                <Image
                  src={detailProject.image}
                  alt={detailProject.alt}
                  fill
                  sizes="100vw"
                />
                <div>
                  <small>
                    {titleCase(detailProject.style)} ·{' '}
                    {titleCase(detailProject.budgetTier)} classification
                  </small>
                  <SheetTitle>{detailProject.name}</SheetTitle>
                </div>
              </div>
              <SheetDescription className="project-summary">
                {detailProject.statement}
              </SheetDescription>
              <div className="project-spec">
                <div>
                  <span>Category</span>
                  <strong>
                    {categoryMap.get(detailProject.category)?.label}
                  </strong>
                </div>
                <div>
                  <span>Scale</span>
                  <strong>{titleCase(detailProject.size)}</strong>
                </div>
                <div>
                  <span>Materials</span>
                  <strong>{detailProject.materials.join(' · ')}</strong>
                </div>
              </div>
              {detailProject.gallery && (
                <div className="project-gallery">
                  {detailProject.gallery.slice(1).map((image, index) => (
                    <figure key={image}>
                      <Image
                        src={image}
                        alt={`${detailProject.name} ${index === 0 ? 'alternate architectural view' : 'joinery detail'}`}
                        fill
                        sizes="(max-width: 820px) 100vw, 50vw"
                      />
                    </figure>
                  ))}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}

function FilterGroup({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="chip-row">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={value === item}
            className={value === item ? 'is-active' : ''}
            onClick={() => onChange(item)}
          >
            {titleCase(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

function HexInput({
  value,
  label,
  onCommit,
}: {
  value: string;
  label: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (!/^#[0-9a-f]{6}$/i.test(draft)) {
      setDraft(value);
      return;
    }
    onCommit(draft.toUpperCase());
  };

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      aria-label={label}
    />
  );
}
