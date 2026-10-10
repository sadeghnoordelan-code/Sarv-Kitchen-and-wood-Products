"use client";

import { gsap } from "gsap";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { flushSync } from "react-dom";
import {
  matchProjectsByCustomPalette,
  normalizeHexColor,
} from "../features/color-matching";
import {
  createEmptyProjectFilters,
  filterProjects,
  getActiveProjectFilters,
  getProjectFilterOptions,
} from "../features/project-filters";
import type { ProjectFilterKey } from "../features/project-filters";
import { projectsByCategory } from "../features/projects";
import { contactDetails } from "../features/contact";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const containKeyboardFocus = (
  event: globalThis.KeyboardEvent,
  container: HTMLElement,
) => {
  if (event.key !== "Tab") return;

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      window.getComputedStyle(element).visibility !== "hidden",
  );

  if (focusableElements.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && (activeElement === firstElement || !container.contains(activeElement))) {
    event.preventDefault();
    lastElement.focus();
  } else if (
    !event.shiftKey &&
    (activeElement === lastElement || !container.contains(activeElement))
  ) {
    event.preventDefault();
    firstElement.focus();
  }
};

const lockBodyScroll = () => {
  const body = document.body;
  const previousOverflow = body.style.overflow;
  body.style.setProperty("overflow", "hidden");

  return () => {
    if (previousOverflow) {
      body.style.setProperty("overflow", previousOverflow);
    } else {
      body.style.removeProperty("overflow");
    }
  };
};

const categories = [
  {
    name: "KITCHEN",
    slug: "kitchen",
    mark: "K",
    scope: "Cabinetry / Islands / Integrated storage",
    tone: "#8f765d",
    depth: "#30261f",
    workspaceImage: "/workspaces/kitchen.webp",
    workspaceImageAlt:
      "Concept visualization of a walnut kitchen with a monolithic stone island",
    workspaceImagePosition: "center center",
  },
  {
    name: "WARDROBE",
    slug: "wardrobe",
    mark: "W",
    scope: "Dressing rooms / Wardrobes / Interior systems",
    tone: "#77736c",
    depth: "#272725",
    workspaceImage: "/workspaces/wardrobe.webp",
    workspaceImageAlt:
      "Concept visualization of an oak walk-in wardrobe with smoked-glass cabinetry",
    workspaceImagePosition: "center center",
  },
  {
    name: "ARCHITECTURAL DOORS",
    slug: "architectural-doors",
    mark: "AD",
    scope: "Full-height doors / Concealed frames / Wall integration",
    tone: "#9a846d",
    depth: "#342b24",
    workspaceImage: "/workspaces/architectural-doors.webp",
    workspaceImageAlt:
      "Concept visualization of a full-height oak pivot door with integrated wall paneling",
    workspaceImagePosition: "center center",
  },
  {
    name: "SKIRTING",
    slug: "skirting",
    mark: "S",
    scope: "Shadow lines / Flush details / Perimeter finishing",
    tone: "#aaa49a",
    depth: "#35332f",
    workspaceImage: "/workspaces/skirting.webp",
    workspaceImageAlt:
      "Concept visualization of recessed shadow-gap skirting across plaster and oak walls",
    workspaceImagePosition: "center center",
  },
  {
    name: "TV WALL / CONSOLE",
    slug: "tv-wall-console",
    mark: "TV",
    scope: "Media walls / Consoles / Integrated lighting",
    tone: "#755947",
    depth: "#281f1a",
    workspaceImage: "/workspaces/tv-wall-console.webp",
    workspaceImageAlt:
      "Concept visualization of a travertine media wall with a floating walnut console",
    workspaceImagePosition: "center center",
  },
  {
    name: "BATHROOM VANITY",
    slug: "bathroom-vanity",
    mark: "BV",
    scope: "Vanities / Tall storage / Mirror integration",
    tone: "#898b86",
    depth: "#2b2d2b",
    workspaceImage: "/workspaces/bathroom-vanity.webp",
    workspaceImageAlt:
      "Concept visualization of a floating walnut bathroom vanity with integrated stone basins",
    workspaceImagePosition: "center center",
  },
] as const;

const selectedProjects = [
  {
    name: "Cedar House",
    slug: "cedar-house",
    image: "/selected-projects/cedar-house.webp",
    type: "Residential interior — editorial concept study",
    location: "Pending project confirmation",
    area: "Pending project confirmation",
    style: "Warm modernism",
    scope: "Concept direction for integrated cabinetry, architectural joinery, and living spaces.",
    materials: "Cedar, warm oak, honed limestone, charcoal metal, and clear glass.",
    palette: "Cedar brown, warm oak, charcoal, and muted limestone.",
    concept: "A quiet residence organized around timber warmth, long views, and cabinetry that reads as part of the architecture.",
    execution: "Execution information pending project confirmation.",
  },
  {
    name: "Pale Courtyard",
    slug: "pale-courtyard",
    image: "/selected-projects/pale-courtyard.webp",
    type: "Residential interior — editorial concept study",
    location: "Pending project confirmation",
    area: "Pending project confirmation",
    style: "Quiet Mediterranean restraint",
    scope: "Concept direction for courtyard-facing rooms, pale joinery, and integrated storage.",
    materials: "Mineral plaster, pale oak, limestone, brushed nickel, and clear glass.",
    palette: "Chalk, pale oak, warm gray stone, and faded linen.",
    concept: "An inward-looking home where soft daylight, mineral surfaces, and precise pale cabinetry create a continuous calm interior.",
    execution: "Execution information pending project confirmation.",
  },
  {
    name: "Stone Frame",
    slug: "stone-frame",
    image: "/selected-projects/stone-frame.webp",
    type: "Residential interior — editorial concept study",
    location: "Pending project confirmation",
    area: "Pending project confirmation",
    style: "Monolithic contemporary",
    scope: "Concept direction for framed thresholds, dark timber joinery, and integrated interior architecture.",
    materials: "Bush-hammered stone, dark walnut, patinated bronze, and smoked glass.",
    palette: "Deep walnut, graphite, weathered bronze, and warm gray stone.",
    concept: "Deep stone portals establish the spatial rhythm while dark joinery forms a precise, recessive layer inside the architecture.",
    execution: "Execution information pending project confirmation.",
  },
] as const;

const teamGroups = [
  {
    index: "01",
    name: "Factory Team",
    role: "Production group",
    status: "Staff roster pending confirmation",
  },
  {
    index: "02",
    name: "Execution / Installation Team",
    role: "Site execution group",
    status: "Staff roster pending confirmation",
  },
  {
    index: "03",
    name: "Technical / Design Team",
    role: "Technical development group",
    status: "Staff roster pending confirmation",
  },
] as const;

const processStages = [
  "Site Measurement",
  "Design",
  "Material Selection",
  "Technical Preparation",
  "Factory Production",
  "Quality Control",
  "Delivery",
  "Installation",
  "Handover",
] as const;

const projectFilterLabels: Record<ProjectFilterKey, string> = {
  style: "Design style",
  size: "Size",
  paletteType: "Color",
  budgetTier: "Budget tier",
};

type CustomColorField = {
  draft: string;
  value: string;
};

type CustomColorIndex = 0 | 1;

const createCustomColorFields = (): [CustomColorField, CustomColorField] => [
  { draft: "#B08E67", value: "#B08E67" },
  { draft: "#D8D0C3", value: "#D8D0C3" },
];

const wrappedCategoryIndex = (index: number) =>
  (index + categories.length) % categories.length;

type PlaneSlot =
  | "hidden-left"
  | "previous"
  | "active"
  | "next"
  | "hidden-right";

type SwipeOrigin = {
  pointerId: number;
  x: number;
  y: number;
  startedAt: number;
};

const getPlaneSlot = (index: number, activeIndex: number): PlaneSlot => {
  const forwardDistance = wrappedCategoryIndex(index - activeIndex);

  if (forwardDistance === 0) return "active";
  if (forwardDistance === 1) return "next";
  if (forwardDistance === categories.length - 1) return "previous";
  if (forwardDistance === categories.length - 2) return "hidden-left";
  return "hidden-right";
};

const getPlanePose = (slot: PlaneSlot) => {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const isTablet = window.matchMedia("(max-width: 900px)").matches;

  const positions = isMobile
    ? { previous: -118, next: 18, hiddenLeft: -168, hiddenRight: 68, rotation: 9, depth: -54 }
    : isTablet
      ? { previous: -112, next: 12, hiddenLeft: -162, hiddenRight: 62, rotation: 16, depth: -88 }
      : { previous: -108, next: 8, hiddenLeft: -154, hiddenRight: 54, rotation: 23, depth: -128 };

  const poses = {
    "hidden-left": {
      x: 0,
      y: 0,
      xPercent: positions.hiddenLeft,
      yPercent: 3,
      z: positions.depth - 90,
      rotateY: positions.rotation + 6,
      scale: 0.91,
      transformOrigin: "right center",
      autoAlpha: 0,
    },
    previous: {
      x: 0,
      y: 0,
      xPercent: positions.previous,
      yPercent: 2,
      z: positions.depth,
      rotateY: positions.rotation,
      scale: 0.94,
      transformOrigin: "right center",
      autoAlpha: 1,
    },
    active: {
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: 0,
      z: 48,
      rotateY: 0,
      scale: 1,
      transformOrigin: "center center",
      autoAlpha: 1,
    },
    next: {
      x: 0,
      y: 0,
      xPercent: positions.next,
      yPercent: 2,
      z: positions.depth,
      rotateY: -positions.rotation,
      scale: 0.94,
      transformOrigin: "left center",
      autoAlpha: 1,
    },
    "hidden-right": {
      x: 0,
      y: 0,
      xPercent: positions.hiddenRight,
      yPercent: 3,
      z: positions.depth - 90,
      rotateY: -positions.rotation - 6,
      scale: 0.91,
      transformOrigin: "left center",
      autoAlpha: 0,
    },
  } as const;

  return poses[slot];
};

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const scrollMetrics = useRef({ start: 0, span: 1 });
  const preserveProgressOnResize = useRef(false);
  const activeCategoryRef = useRef(0);
  const isFieldTransitioningRef = useRef(false);
  const queuedFieldCategoryRef = useRef<number | null>(null);
  const selectCategoryRef = useRef<
    (nextIndex: number, requestedDirection?: -1 | 1) => void
  >(() => undefined);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const planeRefs = useRef<Array<HTMLElement | null>>([]);
  const fieldSectionRef = useRef<HTMLElement>(null);
  const fieldSceneRef = useRef<HTMLDivElement>(null);
  const fieldTypographyRef = useRef<HTMLDivElement>(null);
  const fieldTitleRef = useRef<HTMLHeadingElement>(null);
  const fieldLabelRef = useRef<HTMLParagraphElement>(null);
  const fieldInformationRef = useRef<HTMLElement>(null);
  const fieldWipeOneRef = useRef<HTMLDivElement>(null);
  const fieldWipeTwoRef = useRef<HTMLDivElement>(null);
  const fieldSwipeOriginRef = useRef<SwipeOrigin | null>(null);
  const fieldSwipeConsumedRef = useRef(false);
  const workspaceRef = useRef<HTMLElement>(null);
  const workspaceHeaderRef = useRef<HTMLElement>(null);
  const workspaceMaterialRef = useRef<HTMLDivElement>(null);
  const workspaceTitleRef = useRef<HTMLHeadingElement>(null);
  const workspaceScopeRef = useRef<HTMLParagraphElement>(null);
  const workspaceProjectsRef = useRef<HTMLElement>(null);
  const workspaceResultsRef = useRef<HTMLDivElement>(null);
  const workspaceCloseButtonRef = useRef<HTMLButtonElement>(null);
  const workspaceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const projectBriefRef = useRef<HTMLElement>(null);
  const projectBriefCloseButtonRef = useRef<HTMLButtonElement>(null);
  const selectedProjectTriggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedProjectTriggerIndexRef = useRef<number | null>(null);
  const activeWorkspaceIndexRef = useRef<number | null>(null);
  const workspaceEntranceTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const workspaceExitTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const workspaceResultsTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const isWorkspaceAnimatingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [heroNeedsStart, setHeroNeedsStart] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  const prepareHeroVideo = useCallback((reload = false) => {
    const video = videoRef.current;
    if (!video) return;
    setHeroFailed(false);
    setHeroNeedsStart(false);
    video.muted = true;
    video.defaultMuted = true;
    if (reload || video.error) video.load();
    void video.play().then(() => {
      video.pause();
      if (video.readyState >= 2) setIsReady(true);
    }).catch(() => {
      if (video.readyState < 2) setHeroNeedsStart(true);
    });
  }, []);
  const [visibleProgress, setVisibleProgress] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isFieldTransitioning, setIsFieldTransitioning] = useState(false);
  const [isWorkspaceAnimating, setIsWorkspaceAnimating] = useState(false);
  const [activeWorkspaceIndex, setActiveWorkspaceIndex] = useState<number | null>(null);
  const [activeSelectedProjectIndex, setActiveSelectedProjectIndex] = useState<number | null>(null);
  const [projectFilters, setProjectFilters] = useState(
    createEmptyProjectFilters,
  );
  const [customColorFields, setCustomColorFields] = useState(
    createCustomColorFields,
  );

  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;

    if (!hero || !video) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const measure = () => {
      const previousTarget = targetProgress.current;
      const start = hero.offsetTop;
      const span = Math.max(1, hero.offsetHeight - window.innerHeight);

      scrollMetrics.current = { start, span };

      if (preserveProgressOnResize.current) {
        window.scrollTo({
          top: start + previousTarget * span,
          behavior: "instant",
        });
        preserveProgressOnResize.current = false;
      }
    };

    const readUnifiedScrollProgress = () => {
      const { start, span } = scrollMetrics.current;
      targetProgress.current = clamp01((window.scrollY - start) / span);
    };

    let resizeFrame = 0;
    const handleResize = () => {
      const { start, span } = scrollMetrics.current;
      preserveProgressOnResize.current =
        window.scrollY >= start && window.scrollY <= start + span;
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        measure();
        readUnifiedScrollProgress();
      });
    };

    measure();
    readUnifiedScrollProgress();
    currentProgress.current = targetProgress.current;
    setIsReady(video.readyState >= 2);
    prepareHeroVideo();
    const loadingTimeout = window.setTimeout(() => {
      if (video.readyState < 2) setHeroNeedsStart(true);
    }, 8000);

    window.addEventListener("scroll", readUnifiedScrollProgress, {
      passive: true,
    });
    window.addEventListener("resize", handleResize, { passive: true });

    let animationFrame = 0;
    let previousTime = performance.now();
    let lastAnnouncedProgress = -1;

    const renderFrame = (now: number) => {
      const deltaSeconds = Math.min(0.1, (now - previousTime) / 1000);
      previousTime = now;

      const ease = reducedMotion.matches
        ? 1
        : 1 - Math.exp(-deltaSeconds * 7.5);
      const difference = targetProgress.current - currentProgress.current;

      currentProgress.current =
        Math.abs(difference) < 0.0001
          ? targetProgress.current
          : currentProgress.current + difference * ease;

      if (video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
        const safeDuration = Math.max(0, video.duration - 0.04);
        const requestedTime = currentProgress.current * safeDuration;

        // Let each asynchronous seek settle before requesting the next frame.
        // Continuously replacing an in-flight seek can starve the video decoder.
        if (!video.seeking && Math.abs(video.currentTime - requestedTime) > 0.012) {
          video.currentTime = requestedTime;
        }
      }

      const roundedProgress = Math.round(currentProgress.current * 100);
      if (roundedProgress !== lastAnnouncedProgress) {
        lastAnnouncedProgress = roundedProgress;
        setVisibleProgress(roundedProgress);
      }

      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    animationFrame = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener("scroll", readUnifiedScrollProgress);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(loadingTimeout);
      video.pause();
    };
  }, [prepareHeroVideo]);

  const syncPlanePoses = useCallback(() => {
    planeRefs.current.forEach((plane) => {
      if (!plane) return;
      const slot = plane.dataset.slot as PlaneSlot;
      gsap.set(plane, getPlanePose(slot));
    });
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!isFieldTransitioningRef.current) {
        syncPlanePoses();
      }
    };

    syncPlanePoses();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      transitionTimelineRef.current?.kill();
    };
  }, [syncPlanePoses]);

  useLayoutEffect(() => {
    if (!isFieldTransitioningRef.current) {
      syncPlanePoses();
    }
  }, [activeCategoryIndex, syncPlanePoses]);

  const animateWorkspaceOut = useCallback((onComplete: () => void) => {
    const workspace = workspaceRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!workspace || reducedMotion) {
      isWorkspaceAnimatingRef.current = false;
      setIsWorkspaceAnimating(false);
      onComplete();
      return;
    }

    if (workspaceExitTimelineRef.current?.isActive()) return;

    workspaceEntranceTimelineRef.current?.kill();
    isWorkspaceAnimatingRef.current = true;
    setIsWorkspaceAnimating(true);
    gsap.set(workspace, {
      clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)",
    });

    const titleTargets = [
      workspaceTitleRef.current,
      workspaceScopeRef.current,
    ].filter(Boolean);

    workspaceExitTimelineRef.current = gsap
      .timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          isWorkspaceAnimatingRef.current = false;
          setIsWorkspaceAnimating(false);
          onComplete();
        },
      })
      .to(
        titleTargets,
        {
          yPercent: -28,
          autoAlpha: 0,
          duration: 0.28,
          ease: "power3.in",
          stagger: 0.035,
        },
        0,
      )
      .to(
        workspaceHeaderRef.current,
        { y: -18, autoAlpha: 0, duration: 0.3, ease: "power3.in" },
        0.04,
      )
      .to(
        workspaceMaterialRef.current,
        { scale: 1.035, duration: 0.66, ease: "power2.inOut" },
        0,
      )
      .to(
        workspace,
        {
          clipPath:
            "polygon(112% 0, 112% 0, 100% 100%, 100% 100%)",
          duration: 0.72,
          ease: "power4.inOut",
        },
        0.08,
      );
  }, []);

  useEffect(() => {
    const syncWorkspaceFromLocation = () => {
      const slug = window.location.hash.replace(/^#work\//, "");
      const categoryIndex = categories.findIndex(
        (category) => category.slug === slug,
      );

      if (categoryIndex === -1) {
        const finishClose = () => {
          activeWorkspaceIndexRef.current = null;
          setProjectFilters(createEmptyProjectFilters());
          setActiveWorkspaceIndex(null);
        };

        if (activeWorkspaceIndexRef.current !== null) {
          animateWorkspaceOut(finishClose);
        } else {
          finishClose();
        }
        return;
      }

      const willAnimate = !window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      activeCategoryRef.current = categoryIndex;
      activeWorkspaceIndexRef.current = categoryIndex;
      isWorkspaceAnimatingRef.current = willAnimate;
      setIsWorkspaceAnimating(willAnimate);
      setProjectFilters(createEmptyProjectFilters());
      setActiveCategoryIndex(categoryIndex);
      setActiveWorkspaceIndex(categoryIndex);
    };

    syncWorkspaceFromLocation();
    window.addEventListener("popstate", syncWorkspaceFromLocation);

    return () => {
      window.removeEventListener("popstate", syncWorkspaceFromLocation);
    };
  }, [animateWorkspaceOut]);

  useEffect(() => {
    const syncSelectedProjectFromLocation = () => {
      const slug = window.location.hash.replace(/^#project\//, "");
      const projectIndex = selectedProjects.findIndex(
        (project) => project.slug === slug,
      );

      setActiveSelectedProjectIndex(
        projectIndex === -1 ? null : projectIndex,
      );
    };

    syncSelectedProjectFromLocation();
    window.addEventListener("popstate", syncSelectedProjectFromLocation);

    return () => {
      window.removeEventListener("popstate", syncSelectedProjectFromLocation);
    };
  }, []);

  const openSelectedProject = (
    projectIndex: number,
    trigger: HTMLButtonElement,
  ) => {
    const project = selectedProjects[projectIndex];
    const url = new URL(window.location.href);
    url.hash = `project/${project.slug}`;
    selectedProjectTriggerRefs.current[projectIndex] = trigger;
    selectedProjectTriggerIndexRef.current = projectIndex;
    window.history.pushState(
      { sarvSelectedProject: true, projectIndex },
      "",
      url,
    );
    setActiveSelectedProjectIndex(projectIndex);
  };

  const closeSelectedProject = useCallback(() => {
    if (window.history.state?.sarvSelectedProject) {
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.hash = "selected-projects";
    window.history.replaceState(window.history.state, "", url);
    setActiveSelectedProjectIndex(null);
  }, []);

  useLayoutEffect(() => {
    const brief = projectBriefRef.current;
    if (activeSelectedProjectIndex === null || !brief) return;

    const restoreBodyScroll = lockBodyScroll();
    const selectedProjectTriggers = selectedProjectTriggerRefs.current;
    brief.scrollTop = 0;
    let focusFrame = 0;
    const focusCloseButton = () => {
      focusFrame = window.requestAnimationFrame(() => {
        projectBriefCloseButtonRef.current?.focus();
      });
    };
    let entranceTimeline: gsap.core.Timeline | null = null;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      entranceTimeline = gsap
        .timeline({ onComplete: focusCloseButton })
        .fromTo(
          brief,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 0.82,
            ease: "power4.inOut",
            clearProps: "clipPath",
          },
          0,
        )
        .fromTo(
          brief.querySelectorAll(
            ".project-brief-header, .project-brief-title, .project-brief-visual",
          ),
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.56,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          },
          0.28,
        );
    } else {
      focusCloseButton();
    }

    const handleProjectBriefKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSelectedProject();
      } else {
        containKeyboardFocus(event, brief);
      }
    };

    window.addEventListener("keydown", handleProjectBriefKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleProjectBriefKeyDown);
      entranceTimeline?.kill();
      gsap.killTweensOf(brief);
      gsap.killTweensOf(brief.querySelectorAll("*"));
      restoreBodyScroll();
      const triggerIndex = selectedProjectTriggerIndexRef.current;
      window.requestAnimationFrame(() => {
        if (triggerIndex !== null) {
          selectedProjectTriggers[triggerIndex]?.focus();
        }
      });
    };
  }, [activeSelectedProjectIndex, closeSelectedProject]);

  const selectCategory = useCallback(
    (nextIndex: number, requestedDirection?: -1 | 1) => {
      const currentIndex = activeCategoryRef.current;
      const normalizedNextIndex = wrappedCategoryIndex(nextIndex);

      if (normalizedNextIndex === currentIndex) {
        return;
      }

      if (isFieldTransitioningRef.current) {
        queuedFieldCategoryRef.current = normalizedNextIndex;
        return;
      }

      const forwardDistance = wrappedCategoryIndex(
        normalizedNextIndex - currentIndex,
      );
      const direction =
        requestedDirection ?? (forwardDistance <= categories.length / 2 ? 1 : -1);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        activeCategoryRef.current = normalizedNextIndex;
        flushSync(() => setActiveCategoryIndex(normalizedNextIndex));
        syncPlanePoses();
        return;
      }

      const currentPlane = planeRefs.current[currentIndex];
      const incomingPlane = planeRefs.current[normalizedNextIndex];
      const outgoingSidePlane =
        planeRefs.current[wrappedCategoryIndex(currentIndex - direction)];
      const emergingSidePlane =
        planeRefs.current[wrappedCategoryIndex(currentIndex + direction * 2)];
      const title = fieldTitleRef.current;
      const label = fieldLabelRef.current;
      const information = fieldInformationRef.current;
      const typography = fieldTypographyRef.current;
      const scene = fieldSceneRef.current;
      const wipeOne = fieldWipeOneRef.current;
      const wipeTwo = fieldWipeTwoRef.current;

      if (
        !currentPlane ||
        !incomingPlane ||
        !outgoingSidePlane ||
        !emergingSidePlane ||
        !title ||
        !label ||
        !information ||
        !typography ||
        !scene ||
        !wipeOne ||
        !wipeTwo
      ) {
        activeCategoryRef.current = normalizedNextIndex;
        setActiveCategoryIndex(normalizedNextIndex);
        return;
      }

      isFieldTransitioningRef.current = true;
      setIsFieldTransitioning(true);

      const currentTarget = getPlanePose(
        direction === 1 ? "previous" : "next",
      );
      const incomingTarget = getPlanePose("active");
      const outgoingTarget = getPlanePose(
        direction === 1 ? "hidden-left" : "hidden-right",
      );
      const emergingTarget = getPlanePose(
        direction === 1 ? "next" : "previous",
      );
      const allAnimatedElements = [
        currentPlane,
        incomingPlane,
        outgoingSidePlane,
        emergingSidePlane,
        title,
        label,
        information,
        typography,
        scene,
        wipeOne,
        wipeTwo,
      ];

      gsap.killTweensOf(allAnimatedElements);
      gsap.set(emergingSidePlane, {
        ...getPlanePose(direction === 1 ? "hidden-right" : "hidden-left"),
        visibility: "visible",
      });
      gsap.set([wipeOne, wipeTwo], {
        xPercent: direction === 1 ? -170 : 170,
        autoAlpha: 0,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          syncPlanePoses();
          gsap.set([title, label, information, typography, wipeOne, wipeTwo], {
            clearProps: "transform,opacity,visibility",
          });
          transitionTimelineRef.current = null;
          isFieldTransitioningRef.current = false;
          setIsFieldTransitioning(false);

          const queuedCategory = queuedFieldCategoryRef.current;
          queuedFieldCategoryRef.current = null;
          if (
            queuedCategory !== null &&
            queuedCategory !== activeCategoryRef.current
          ) {
            const queuedDirection =
              queuedCategory > activeCategoryRef.current ? 1 : -1;
            const nextQueuedCategory = wrappedCategoryIndex(
              activeCategoryRef.current + queuedDirection,
            );

            if (nextQueuedCategory !== queuedCategory) {
              queuedFieldCategoryRef.current = queuedCategory;
            }

            window.requestAnimationFrame(() => {
              selectCategoryRef.current(
                nextQueuedCategory,
                queuedDirection,
              );
            });
          }
        },
      });

      transitionTimelineRef.current = timeline;
      timeline
        .to(title, { yPercent: direction === 1 ? -112 : 112, duration: 0.38, ease: "power3.in" }, 0)
        .to(label, { yPercent: direction === 1 ? -90 : 90, autoAlpha: 0, duration: 0.3, ease: "power3.in" }, 0.03)
        .to(information, {
          xPercent: direction === 1 ? -22 : 22,
          yPercent: 8,
          clipPath: direction === 1 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
          autoAlpha: 0,
          duration: 0.46,
          ease: "power3.inOut",
        }, 0.02)
        .to(typography, { xPercent: direction === 1 ? -4 : 4, duration: 0.64, ease: "power2.inOut" }, 0)
        .to(scene, { backgroundPositionX: direction === 1 ? "56%" : "44%", duration: 0.9, ease: "power2.inOut" }, 0.1)
        .to(outgoingSidePlane, { ...outgoingTarget, duration: 0.92, ease: "power3.inOut" }, 0.13)
        .to(currentPlane, { ...currentTarget, duration: 1.08, ease: "power4.inOut" }, 0.16)
        .to(incomingPlane, { ...incomingTarget, duration: 1.08, ease: "power4.inOut" }, 0.16)
        .to(emergingSidePlane, { ...emergingTarget, duration: 0.92, ease: "power3.inOut" }, 0.34)
        .to(wipeOne, { xPercent: direction === 1 ? 620 : -620, autoAlpha: 0.9, duration: 0.82, ease: "power3.inOut" }, 0.28)
        .to(wipeTwo, { xPercent: direction === 1 ? 610 : -610, autoAlpha: 0.72, duration: 0.92, ease: "power3.inOut" }, 0.37)
        .add(() => {
          activeCategoryRef.current = normalizedNextIndex;
          flushSync(() => setActiveCategoryIndex(normalizedNextIndex));
          gsap.set(title, { yPercent: direction === 1 ? 118 : -118 });
          gsap.set(label, { yPercent: direction === 1 ? 70 : -70, autoAlpha: 0 });
          gsap.set(information, {
            xPercent: direction === 1 ? 22 : -22,
            yPercent: 8,
            clipPath: direction === 1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
            autoAlpha: 0,
          });
          gsap.set(typography, { xPercent: direction === 1 ? 3 : -3 });
        }, 0.76)
        .to(information, {
          xPercent: 0,
          yPercent: 0,
          clipPath: "inset(0 0% 0 0%)",
          autoAlpha: 1,
          duration: 0.52,
          ease: "power3.out",
        }, 0.86)
        .to(title, { yPercent: 0, duration: 0.58, ease: "power4.out" }, 0.92)
        .to(label, { yPercent: 0, autoAlpha: 1, duration: 0.44, ease: "power3.out" }, 0.98)
        .to(typography, { xPercent: 0, duration: 0.58, ease: "power3.out" }, 0.9)
        .to(scene, { backgroundPositionX: "50%", duration: 0.5, ease: "power2.out" }, 0.92);
    },
    [syncPlanePoses],
  );

  useEffect(() => {
    selectCategoryRef.current = selectCategory;
  }, [selectCategory]);

  useEffect(() => {
    const section = fieldSectionRef.current;
    const shell = section?.querySelector<HTMLElement>(".field-shell");
    const intro = section?.querySelector<HTMLElement>(".field-intro");
    if (!section || !shell || !intro) return;

    let frame = 0;
    let scrollStart = 0;
    let scrollEnd = 1;

    const measureScrollRange = () => {
      scrollStart = section.offsetTop + intro.offsetTop + intro.offsetHeight;
      scrollEnd = section.offsetTop + section.offsetHeight - window.innerHeight;
    };

    const syncCategoryToScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (
          window.innerWidth <= 900 ||
          activeWorkspaceIndexRef.current !== null ||
          activeSelectedProjectIndex !== null
        ) {
          return;
        }

        const progress = clamp01(
          (window.scrollY - scrollStart) / Math.max(1, scrollEnd - scrollStart),
        );
        const nextIndex = Math.round(progress * (categories.length - 1));

        if (nextIndex !== activeCategoryRef.current) {
          selectCategoryRef.current(
            nextIndex,
            nextIndex > activeCategoryRef.current ? 1 : -1,
          );
        }
      });
    };

    const handleScrollResize = () => {
      measureScrollRange();
      syncCategoryToScroll();
    };

    measureScrollRange();
    syncCategoryToScroll();
    window.addEventListener("scroll", syncCategoryToScroll, { passive: true });
    window.addEventListener("resize", handleScrollResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncCategoryToScroll);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [activeSelectedProjectIndex]);

  const selectRelativeCategory = (direction: -1 | 1) => {
    selectCategory(activeCategoryRef.current + direction, direction);
  };

  const handleFieldKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectRelativeCategory(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectRelativeCategory(1);
    }
  };

  const handleFieldPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    fieldSwipeConsumedRef.current = false;
    fieldSwipeOriginRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
    };
  };

  const handleFieldPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const origin = fieldSwipeOriginRef.current;
    fieldSwipeOriginRef.current = null;

    if (!origin || origin.pointerId !== event.pointerId) return;

    const horizontalDistance = event.clientX - origin.x;
    const verticalDistance = event.clientY - origin.y;
    const elapsed = performance.now() - origin.startedAt;

    if (
      elapsed > 900 ||
      Math.abs(horizontalDistance) < 56 ||
      Math.abs(horizontalDistance) <= Math.abs(verticalDistance) * 1.25
    ) {
      return;
    }

    fieldSwipeConsumedRef.current = true;
    window.setTimeout(() => {
      fieldSwipeConsumedRef.current = false;
    }, 0);
    selectRelativeCategory(horizontalDistance < 0 ? 1 : -1);
  };

  const handleFieldPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (fieldSwipeOriginRef.current?.pointerId === event.pointerId) {
      fieldSwipeOriginRef.current = null;
    }
  };

  const openCategoryWorkspace = (
    categoryIndex: number,
    trigger: HTMLButtonElement,
  ) => {
    if (
      fieldSwipeConsumedRef.current ||
      categoryIndex !== activeCategoryRef.current ||
      isFieldTransitioningRef.current
    ) {
      return;
    }

    workspaceTriggerRef.current = trigger;
    const category = categories[categoryIndex];
    const willAnimate = !window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const url = new URL(window.location.href);
    url.hash = `work/${category.slug}`;
    window.history.pushState(
      { sarvCategoryWorkspace: true, categoryIndex },
      "",
      url,
    );
    activeWorkspaceIndexRef.current = categoryIndex;
    isWorkspaceAnimatingRef.current = willAnimate;
    setIsWorkspaceAnimating(willAnimate);
    setProjectFilters(createEmptyProjectFilters());
    setActiveWorkspaceIndex(categoryIndex);
  };

  const closeCategoryWorkspace = useCallback(() => {
    if (workspaceExitTimelineRef.current?.isActive()) return;

    if (window.history.state?.sarvCategoryWorkspace) {
      window.history.back();
      return;
    }

    animateWorkspaceOut(() => {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(window.history.state, "", url);
      activeWorkspaceIndexRef.current = null;
      setProjectFilters(createEmptyProjectFilters());
      setActiveWorkspaceIndex(null);
    });
  }, [animateWorkspaceOut, setProjectFilters]);

  useEffect(() => {
    if (activeWorkspaceIndex === null) return;

    const workspace = workspaceRef.current;
    const restoreBodyScroll = lockBodyScroll();

    const focusFrame = window.requestAnimationFrame(() => {
      if (!isWorkspaceAnimatingRef.current) {
        workspaceCloseButtonRef.current?.focus();
      }
    });

    const handleWorkspaceKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCategoryWorkspace();
      } else if (workspace) {
        containKeyboardFocus(event, workspace);
      }
    };

    window.addEventListener("keydown", handleWorkspaceKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleWorkspaceKeyDown);
      restoreBodyScroll();
      window.requestAnimationFrame(() => workspaceTriggerRef.current?.focus());
    };
  }, [activeWorkspaceIndex, closeCategoryWorkspace]);

  useLayoutEffect(() => {
    if (activeWorkspaceIndex === null) return;

    const workspace = workspaceRef.current;
    const header = workspaceHeaderRef.current;
    const material = workspaceMaterialRef.current;
    const title = workspaceTitleRef.current;
    const scope = workspaceScopeRef.current;

    if (!workspace || !header || !material || !title || !scope) return;

    workspace.scrollTop = 0;
    workspaceEntranceTimelineRef.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([workspace, header, material, title, scope], {
        clearProps: "all",
      });
      isWorkspaceAnimatingRef.current = false;
      return;
    }

    isWorkspaceAnimatingRef.current = true;
    gsap.set(workspace, {
      clipPath: "polygon(0 0, 0 0, -12% 100%, -12% 100%)",
    });
    gsap.set(header, { y: -18, autoAlpha: 0 });
    gsap.set(material, {
      scale: 1.045,
      transformOrigin: "50% 50%",
    });
    gsap.set(title, { yPercent: 112 });
    gsap.set(scope, { y: 18, autoAlpha: 0 });

    workspaceEntranceTimelineRef.current = gsap
      .timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          gsap.set([workspace, header, material, title, scope], {
            clearProps: "transform,opacity,visibility,clipPath",
          });
          isWorkspaceAnimatingRef.current = false;
          setIsWorkspaceAnimating(false);
          window.requestAnimationFrame(() =>
            workspaceCloseButtonRef.current?.focus(),
          );
        },
      })
      .to(
        workspace,
        {
          clipPath: "polygon(0 0, 112% 0, 100% 100%, -12% 100%)",
          duration: 0.88,
          ease: "power4.inOut",
        },
        0,
      )
      .to(
        material,
        { scale: 1, duration: 1.05, ease: "power3.out" },
        0.08,
      )
      .to(
        header,
        { y: 0, autoAlpha: 1, duration: 0.42, ease: "power3.out" },
        0.38,
      )
      .to(
        title,
        { yPercent: 0, duration: 0.58, ease: "power4.out" },
        0.42,
      )
      .to(
        scope,
        { y: 0, autoAlpha: 1, duration: 0.44, ease: "power3.out" },
        0.52,
      );

    return () => {
      workspaceEntranceTimelineRef.current?.kill();
    };
  }, [activeWorkspaceIndex]);

  const activeCategory = categories[activeCategoryIndex];
  const activeWorkspace =
    activeWorkspaceIndex === null ? null : categories[activeWorkspaceIndex];
  const activeSelectedProject =
    activeSelectedProjectIndex === null
      ? null
      : selectedProjects[activeSelectedProjectIndex];
  const activeWorkspaceProjects = useMemo(
    () => (activeWorkspace ? projectsByCategory[activeWorkspace.name] : []),
    [activeWorkspace],
  );
  const projectFilterOptions = useMemo(
    () => getProjectFilterOptions(activeWorkspaceProjects),
    [activeWorkspaceProjects],
  );
  const isCustomColorActive = projectFilters.paletteType === "Custom";
  const customColorDraftsAreValid = customColorFields.every(
    (field) => normalizeHexColor(field.draft) !== null,
  );
  const customPalette = useMemo(
    () => [customColorFields[0].value, customColorFields[1].value] as const,
    [customColorFields],
  );
  const customColorCandidates = useMemo(
    () =>
      filterProjects(activeWorkspaceProjects, {
        ...projectFilters,
        paletteType: null,
      }),
    [activeWorkspaceProjects, projectFilters],
  );
  const customColorMatches = useMemo(
    () => matchProjectsByCustomPalette(customColorCandidates, customPalette),
    [customColorCandidates, customPalette],
  );
  const filteredWorkspaceProjects = useMemo(
    () =>
      isCustomColorActive
        ? customColorDraftsAreValid
          ? customColorMatches.exact.map((match) => match.project)
          : []
        : filterProjects(activeWorkspaceProjects, projectFilters),
    [
      activeWorkspaceProjects,
      customColorDraftsAreValid,
      customColorMatches.exact,
      isCustomColorActive,
      projectFilters,
    ],
  );
  const closestColorMatches = useMemo(
    () =>
      isCustomColorActive &&
      customColorDraftsAreValid &&
      filteredWorkspaceProjects.length === 0
        ? customColorMatches.closest.slice(0, 3)
        : [],
    [
      customColorDraftsAreValid,
      customColorMatches.closest,
      filteredWorkspaceProjects.length,
      isCustomColorActive,
    ],
  );
  const hasClosestColorMatches = closestColorMatches.length > 0;
  const displayedWorkspaceProjects = hasClosestColorMatches
    ? closestColorMatches.map((match) => match.project)
    : filteredWorkspaceProjects;
  const closestColorDistanceByProject = useMemo(
    () =>
      new Map(
        closestColorMatches.map((match) => [match.project.id, match.distance]),
      ),
    [closestColorMatches],
  );
  const activeProjectFilters = useMemo(
    () => getActiveProjectFilters(projectFilters),
    [projectFilters],
  );
  const workspaceResultsMotionKey = useMemo(
    () =>
      [
        activeWorkspaceIndex ?? "closed",
        projectFilters.style ?? "all-styles",
        projectFilters.size ?? "all-sizes",
        projectFilters.paletteType ?? "all-colors",
        projectFilters.budgetTier ?? "all-budgets",
        customColorFields.map((field) => field.draft).join("+"),
        hasClosestColorMatches ? "closest" : "exact",
        displayedWorkspaceProjects.map((project) => project.id).join(","),
      ].join("|"),
    [
      activeWorkspaceIndex,
      customColorFields,
      displayedWorkspaceProjects,
      hasClosestColorMatches,
      projectFilters,
    ],
  );

  useLayoutEffect(() => {
    const results = workspaceResultsRef.current;
    if (!results || activeWorkspaceIndex === null) return;

    const targets = Array.from(results.children);
    if (targets.length === 0) return;

    workspaceResultsTimelineRef.current?.kill();
    gsap.killTweensOf(targets);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, {
        clearProps: "transform,opacity,visibility,clipPath",
      });
      return;
    }

    workspaceResultsTimelineRef.current = gsap
      .timeline({ defaults: { overwrite: "auto" } })
      .fromTo(
        targets,
        {
          y: 20,
          autoAlpha: 0,
          clipPath: "inset(0 0 8% 0)",
        },
        {
          y: 0,
          autoAlpha: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.38,
          ease: "power3.out",
          stagger: 0.045,
          clearProps: "transform,opacity,visibility,clipPath",
        },
      );

    return () => {
      workspaceResultsTimelineRef.current?.kill();
    };
  }, [activeWorkspaceIndex, workspaceResultsMotionKey]);

  const clearProjectFilter = (key: ProjectFilterKey) => {
    setProjectFilters((currentFilters) => {
      switch (key) {
        case "style":
          return { ...currentFilters, style: null };
        case "size":
          return { ...currentFilters, size: null };
        case "paletteType":
          return { ...currentFilters, paletteType: null };
        case "budgetTier":
          return { ...currentFilters, budgetTier: null };
      }
    });
  };

  const updateCustomColorFromPicker = (
    index: CustomColorIndex,
    value: string,
  ) => {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;

    setCustomColorFields((currentFields) => {
      const nextFields = [...currentFields] as [
        CustomColorField,
        CustomColorField,
      ];
      nextFields[index] = { draft: normalized, value: normalized };
      return nextFields;
    });
  };

  const updateCustomColorDraft = (index: CustomColorIndex, value: string) => {
    const uppercaseValue = value.toUpperCase();
    if (!/^#?[0-9A-F]{0,6}$/.test(uppercaseValue)) return;

    const draft = uppercaseValue.startsWith("#")
      ? uppercaseValue
      : `#${uppercaseValue}`;
    const normalized = normalizeHexColor(draft);

    setCustomColorFields((currentFields) => {
      const nextFields = [...currentFields] as [
        CustomColorField,
        CustomColorField,
      ];
      nextFields[index] = {
        draft,
        value: normalized ?? currentFields[index].value,
      };
      return nextFields;
    });
  };

  const restoreCustomColorDraft = (index: CustomColorIndex) => {
    setCustomColorFields((currentFields) => {
      if (normalizeHexColor(currentFields[index].draft)) return currentFields;

      const nextFields = [...currentFields] as [
        CustomColorField,
        CustomColorField,
      ];
      nextFields[index] = {
        ...currentFields[index],
        draft: currentFields[index].value,
      };
      return nextFields;
    });
  };

  return (
    <main className="sarv-page">
      <section
        ref={heroRef}
        className="hero-sequence"
        aria-label="SARV introduction"
        aria-hidden={activeWorkspace !== null || activeSelectedProject !== null}
        inert={activeWorkspace !== null || activeSelectedProject !== null}
      >
        <div className="hero-stage">
          <video
            ref={videoRef}
            className={`hero-video${isReady ? " is-ready" : ""}`}
            src="/media/sarv-hero.mp4"
            preload="auto"
            muted
            playsInline
            aria-hidden="true"
            poster="/media/sarv-hero-poster.webp"
            onLoadedData={() => {
              setIsReady(true);
              setHeroNeedsStart(false);
              setHeroFailed(false);
            }}
            onPlaying={(event) => event.currentTarget.pause()}
            onError={() => {
              setIsReady(false);
              setHeroFailed(true);
              setHeroNeedsStart(true);
            }}
          />

          {heroNeedsStart && (
            <button className="hero-start" type="button" onClick={() => prepareHeroVideo(true)}>
              {heroFailed ? "Retry film" : "Start film"}
            </button>
          )}

          <div className="hero-shade" aria-hidden="true" />

          <header className="hero-header">
            <a className="wordmark" href="#top" aria-label="SARV home">
              SARV
            </a>
            <p>Cabinetry &amp; Architectural Woodwork</p>
            <span className="hero-index" aria-hidden="true">
              01 / 06
            </span>
          </header>

          <div id="top" className="hero-title-block">
            <p className="hero-kicker">Material · Detail · Space</p>
            <h1>
              <span>Made for</span>
              <span>the architecture.</span>
            </h1>
          </div>

          <div className="hero-footer">
            <p className="scroll-instruction">Scroll to move through the film</p>
            <div
              className="hero-progress"
              role="progressbar"
              aria-label="Hero film progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={visibleProgress}
              aria-valuetext={`${visibleProgress}% through the introduction film`}
            >
              <span style={{ transform: `scaleX(${visibleProgress / 100})` }} />
            </div>
            <output aria-live="off">{String(visibleProgress).padStart(2, "0")}</output>
          </div>

          {!isReady && !heroNeedsStart && (
            <div className="hero-loading" role="status">
              <span />
              Preparing film
            </div>
          )}
        </div>
      </section>

      <section
        ref={fieldSectionRef}
        className="field-section"
        aria-labelledby="field-title"
        aria-hidden={activeWorkspace !== null || activeSelectedProject !== null}
        data-workspace-hidden={
          activeWorkspace !== null && !isWorkspaceAnimating
        }
        data-workspace-transitioning={
          activeWorkspace !== null && isWorkspaceAnimating
        }
        inert={activeWorkspace !== null || activeSelectedProject !== null}
        tabIndex={0}
        onKeyDown={handleFieldKeyDown}
      >
        <div className="field-intro">
          <p className="field-eyebrow">02 — Field of Works</p>
          <h2 id="field-title">Six areas of architectural woodwork.</h2>
          <p>Explore the disciplines that shape a complete interior.</p>
        </div>

        <div className="field-shell">
          <div
            ref={fieldSceneRef}
            className="field-scene"
            aria-live="polite"
            aria-busy={isFieldTransitioning}
            onPointerDown={handleFieldPointerDown}
            onPointerUp={handleFieldPointerUp}
            onPointerCancel={handleFieldPointerCancel}
          >
            <div ref={fieldWipeOneRef} className="field-wipe field-wipe-one" aria-hidden="true" />
            <div ref={fieldWipeTwoRef} className="field-wipe field-wipe-two" aria-hidden="true" />

            {categories.map((category, categoryIndex) => {
              const slot = getPlaneSlot(categoryIndex, activeCategoryIndex);
              const planeStyle = {
                "--plane-tone": category.tone,
                "--plane-depth": category.depth,
              } as CSSProperties;

              return (
                <article
                  ref={(element) => {
                    planeRefs.current[categoryIndex] = element;
                  }}
                  className="category-plane"
                  data-slot={slot}
                  data-category-index={categoryIndex}
                  style={planeStyle}
                  aria-hidden={slot !== "active"}
                  key={category.name}
                >
                  <Image
                    className="category-plane-image"
                    src={category.workspaceImage}
                    alt=""
                    fill
                    priority={categoryIndex < 3}
                    sizes="(max-width: 600px) 84vw, (max-width: 900px) 76vw, 66vw"
                    style={{ objectPosition: category.workspaceImagePosition }}
                  />
                  <span className="category-plane-shade" aria-hidden="true" />
                  <button
                    type="button"
                    className="category-open-trigger"
                    aria-label={`Open ${category.name} workspace`}
                    disabled={
                      slot !== "active" || isFieldTransitioning
                    }
                    onClick={(event) =>
                      openCategoryWorkspace(
                        categoryIndex,
                        event.currentTarget,
                      )
                    }
                  >
                    <span>Open workspace</span>
                  </button>
                  <span className="plane-number">
                    {String(categoryIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="plane-mark" aria-hidden="true">
                    {category.mark}
                  </span>
                  <span className="plane-rule" aria-hidden="true" />
                  <p>{category.name}</p>
                </article>
              );
            })}

            <div ref={fieldTypographyRef} className="field-typography">
              <p ref={fieldLabelRef} className="field-current-label">Current discipline</p>
              <div className="field-title-mask">
                <h3 ref={fieldTitleRef}>{activeCategory.name}</h3>
              </div>
            </div>

            <aside ref={fieldInformationRef} className="field-information" aria-label="Active category information">
              <span>{String(activeCategoryIndex + 1).padStart(2, "0")}</span>
              <p>{activeCategory.scope}</p>
            </aside>
          </div>

          <footer className="field-controls">
            <div className="field-direction-controls">
              <button
                type="button"
                onClick={() => selectRelativeCategory(-1)}
                disabled={isFieldTransitioning}
                aria-label="Show previous work category"
              >
                <span aria-hidden="true">←</span>
                Previous
              </button>
              <button
                type="button"
                onClick={() => selectRelativeCategory(1)}
                disabled={isFieldTransitioning}
                aria-label="Show next work category"
              >
                Next
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <ol className="field-index" aria-label="Work categories">
              {categories.map((category, index) => (
                <li key={category.name}>
                  <button
                    type="button"
                    data-selected={index === activeCategoryIndex}
                    aria-label={`Show ${category.name}`}
                    aria-pressed={index === activeCategoryIndex}
                    disabled={isFieldTransitioning}
                    onClick={() => selectCategory(index)}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ol>

            <p className="field-position">
              <span>{String(activeCategoryIndex + 1).padStart(2, "0")}</span>
              <span aria-hidden="true">/</span>
              <span>06</span>
            </p>
          </footer>
        </div>
      </section>

      <section
        id="selected-projects"
        className="selected-projects"
        aria-labelledby="selected-projects-title"
        aria-hidden={activeWorkspace !== null || activeSelectedProject !== null}
        inert={activeWorkspace !== null || activeSelectedProject !== null}
      >
        <header className="selected-projects-intro">
          <p>03 — Selected Projects</p>
          <h2 id="selected-projects-title">
            Three studies in material continuity.
          </h2>
          <p>
            Coordinated editorial concept sets. Project facts remain pending
            until formally approved.
          </p>
        </header>

        <ol className="selected-project-list">
          {selectedProjects.map((project, projectIndex) => (
            <li key={project.slug}>
              <article className="selected-project">
                <button
                  ref={(element) => {
                    selectedProjectTriggerRefs.current[projectIndex] = element;
                  }}
                  type="button"
                  aria-label={`Open ${project.name} project brief`}
                  onClick={(event) =>
                    openSelectedProject(projectIndex, event.currentTarget)
                  }
                >
                  <figure className="selected-project-visual">
                    <Image
                      src={project.image}
                      alt={`${project.name} coordinated architectural concept views`}
                      fill
                      sizes="(max-width: 760px) 100vw, 82vw"
                    />
                    <figcaption>
                      <span>
                        {String(projectIndex + 1).padStart(2, "0")} / 03
                      </span>
                      <span>Open project brief</span>
                    </figcaption>
                  </figure>

                  <div className="selected-project-copy">
                    <p>Editorial concept study</p>
                    <h3>{project.name}</h3>
                    <p>{project.style}</p>
                    <span aria-hidden="true">↗</span>
                  </div>
                </button>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="studio"
        className="final-section"
        aria-labelledby="final-section-title"
        aria-hidden={activeWorkspace !== null || activeSelectedProject !== null}
        inert={activeWorkspace !== null || activeSelectedProject !== null}
      >
        <header className="final-section-intro">
          <p>04 — Making SARV</p>
          <h2 id="final-section-title">From drawing to handover.</h2>
          <p>
            Three coordinated disciplines carry each approved project through
            technical development, production, and installation.
          </p>
        </header>

        <section className="team-groups" aria-labelledby="team-groups-title">
          <header>
            <p>Teams / 03</p>
            <h3 id="team-groups-title">One continuous line of responsibility.</h3>
          </header>

          <ol>
            {teamGroups.map((team) => (
              <li key={team.name}>
                <span>{team.index}</span>
                <div>
                  <p>{team.role}</p>
                  <h4>{team.name}</h4>
                </div>
                <p>{team.status}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <header>
            <p>Process / 09 stages</p>
            <h3 id="process-title">A compact path from site to completion.</h3>
          </header>

          <ol className="process-timeline">
            {processStages.map((stage, stageIndex) => (
              <li key={stage}>
                <span>{String(stageIndex + 1).padStart(2, "0")}</span>
                <p>{stage}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="contact-section" aria-labelledby="contact-title">
          <header>
            <p>Contact / Configurable</p>
            <h3 id="contact-title">Begin with the right information.</h3>
            <p>
              Contact details will appear here after SARV confirms the
              corresponding channel.
            </p>
          </header>

          <address className="contact-directory">
            {contactDetails.map((detail, detailIndex) => (
              <div key={detail.key} data-contact-key={detail.key}>
                <span>{String(detailIndex + 1).padStart(2, "0")}</span>
                <p>{detail.label}</p>
                {detail.value && detail.href ? (
                  <a href={detail.href}>{detail.value}</a>
                ) : (
                  <span>Pending confirmation</span>
                )}
              </div>
            ))}
          </address>
        </section>

        <footer className="site-footer">
          <div>
            <p>SARV</p>
            <p>Cabinetry &amp; Architectural Woodwork</p>
          </div>
          <p>Material · Detail · Space</p>
          <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
        </footer>
      </section>

      {activeWorkspace && (
        <section
          ref={workspaceRef}
          className="category-workspace"
          role="dialog"
          aria-modal="true"
          aria-busy={isWorkspaceAnimating}
          aria-labelledby="category-workspace-title"
          aria-describedby="category-workspace-scope"
          tabIndex={-1}
        >
          <header ref={workspaceHeaderRef} className="workspace-header">
            <p>SARV / Field of Works</p>
            <button
              ref={workspaceCloseButtonRef}
              type="button"
              disabled={isWorkspaceAnimating}
              onClick={closeCategoryWorkspace}
            >
              <span aria-hidden="true">←</span>
              Back to Field of Works
            </button>
            <p>
              {String(activeWorkspaceIndex! + 1).padStart(2, "0")} / 06
            </p>
          </header>

          <div
            className="workspace-stage"
            style={
              {
                "--workspace-tone": activeWorkspace.tone,
                "--workspace-depth": activeWorkspace.depth,
              } as CSSProperties
            }
          >
            <div
              ref={workspaceMaterialRef}
              className="workspace-material"
            >
              <Image
                src={activeWorkspace.workspaceImage}
                alt={activeWorkspace.workspaceImageAlt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 66vw"
                style={{ objectPosition: activeWorkspace.workspaceImagePosition }}
              />
              <span aria-hidden="true">{activeWorkspace.mark}</span>
            </div>

            <div className="workspace-title-block">
              <p>Category workspace</p>
              <div className="workspace-title-mask">
                <h2 ref={workspaceTitleRef} id="category-workspace-title">
                  {activeWorkspace.name}
                </h2>
              </div>
              <p ref={workspaceScopeRef} id="category-workspace-scope">
                {activeWorkspace.scope}
              </p>
            </div>
          </div>

          <section
            ref={workspaceProjectsRef}
            className="workspace-projects"
            aria-labelledby="workspace-projects-title"
          >
            <header className="workspace-projects-intro">
              <p>Project matrix / 05 studies</p>
              <h3 id="workspace-projects-title">
                Five material studies for {activeWorkspace.name.toLowerCase()}.
              </h3>
              <p>
                Concept visualizations built from explicit metadata. They are
                not presented as completed client commissions.
              </p>
            </header>

            <section
              className="workspace-filter-system"
              aria-label="Project filters"
            >
              <div className="workspace-filter-summary" aria-live="polite">
                <p className="workspace-filter-count">
                  <span>
                    {String(filteredWorkspaceProjects.length).padStart(2, "0")}
                  </span>
                  {" "}
                  {filteredWorkspaceProjects.length === 1
                    ? "Exact match"
                    : "Exact matches"}
                </p>

                <div
                  className="workspace-filter-path"
                  aria-label="Active filter path"
                >
                  <span>{activeWorkspace.name}</span>
                  {activeProjectFilters.map((filter) => (
                    <div key={filter.key}>
                      <span aria-hidden="true">/</span>
                      <button
                        type="button"
                        aria-label={`Remove ${projectFilterLabels[filter.key]} filter: ${
                          filter.key === "paletteType" &&
                          filter.value === "Custom"
                            ? `${customPalette[0]} and ${customPalette[1]}`
                            : filter.value
                        }`}
                        onClick={() => clearProjectFilter(filter.key)}
                      >
                        {filter.key === "paletteType" &&
                        filter.value === "Custom"
                          ? `${customPalette[0]} + ${customPalette[1]}`
                          : filter.value}
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                  ))}
                </div>

                {activeProjectFilters.length > 0 && (
                  <button
                    type="button"
                    className="workspace-filter-clear"
                    onClick={() =>
                      setProjectFilters(createEmptyProjectFilters())
                    }
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="workspace-filter-groups">
                <fieldset className="workspace-filter-group">
                  <legend>Design style</legend>
                  <div>
                    {projectFilterOptions.style.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={projectFilters.style === value}
                        onClick={() =>
                          setProjectFilters((currentFilters) => ({
                            ...currentFilters,
                            style:
                              currentFilters.style === value ? null : value,
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="workspace-filter-group">
                  <legend>Size</legend>
                  <div>
                    {projectFilterOptions.size.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={projectFilters.size === value}
                        onClick={() =>
                          setProjectFilters((currentFilters) => ({
                            ...currentFilters,
                            size:
                              currentFilters.size === value ? null : value,
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="workspace-filter-group">
                  <legend>Color</legend>
                  <div>
                    {projectFilterOptions.paletteType.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={projectFilters.paletteType === value}
                        onClick={() =>
                          setProjectFilters((currentFilters) => ({
                            ...currentFilters,
                            paletteType:
                              currentFilters.paletteType === value
                                ? null
                                : value,
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  {isCustomColorActive && (
                    <div
                      className="custom-palette-editor"
                      aria-label="Custom two-color palette"
                    >
                      <header>
                        <p>Two-color study</p>
                        <span>Lab / ΔE</span>
                      </header>

                      <div className="custom-palette-fields">
                        {customColorFields.map((field, index) => {
                          const colorIndex = index as CustomColorIndex;
                          const displayIndex = String(index + 1).padStart(
                            2,
                            "0",
                          );
                          const draftIsValid =
                            normalizeHexColor(field.draft) !== null;

                          return (
                            <div
                              className="custom-palette-field"
                              key={displayIndex}
                            >
                              <label
                                htmlFor={`custom-color-picker-${displayIndex}`}
                              >
                                Color {displayIndex}
                              </label>
                              <input
                                id={`custom-color-picker-${displayIndex}`}
                                className="custom-color-picker"
                                type="color"
                                value={field.value}
                                aria-label={`Visual picker for custom color ${index + 1}`}
                                onChange={(event) =>
                                  updateCustomColorFromPicker(
                                    colorIndex,
                                    event.currentTarget.value,
                                  )
                                }
                              />
                              <input
                                className="custom-color-hex"
                                type="text"
                                value={field.draft}
                                inputMode="text"
                                maxLength={7}
                                pattern="#[0-9A-Fa-f]{6}"
                                spellCheck={false}
                                aria-label={`HEX value for custom color ${index + 1}`}
                                aria-invalid={!draftIsValid}
                                onChange={(event) =>
                                  updateCustomColorDraft(
                                    colorIndex,
                                    event.currentTarget.value,
                                  )
                                }
                                onBlur={() =>
                                  restoreCustomColorDraft(colorIndex)
                                }
                              />
                            </div>
                          );
                        })}
                      </div>

                      <p className="custom-palette-note">
                        Two HEX colors · closest palettes remain separate from
                        exact results.
                      </p>
                    </div>
                  )}
                </fieldset>

                <fieldset className="workspace-filter-group">
                  <legend>Budget tier</legend>
                  <div>
                    {projectFilterOptions.budgetTier.map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={projectFilters.budgetTier === value}
                        onClick={() =>
                          setProjectFilters((currentFilters) => ({
                            ...currentFilters,
                            budgetTier:
                              currentFilters.budgetTier === value
                                ? null
                                : value,
                          }))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            <div
              ref={workspaceResultsRef}
              className="workspace-results"
              data-motion-key={workspaceResultsMotionKey}
            >
            {filteredWorkspaceProjects.length === 0 && (
              <div
                className={`workspace-filter-empty${hasClosestColorMatches ? " is-color-empty" : ""}`}
                role="status"
              >
                <p>
                  {isCustomColorActive && !customColorDraftsAreValid
                    ? "ENTER TWO VALID HEX COLORS"
                    : hasClosestColorMatches
                      ? "NO EXACT COLOR MATCH"
                      : "NO EXACT MATCHES"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (isCustomColorActive && !customColorDraftsAreValid) {
                      setCustomColorFields(createCustomColorFields());
                    } else if (hasClosestColorMatches) {
                      clearProjectFilter("paletteType");
                    } else {
                      setProjectFilters(createEmptyProjectFilters());
                    }
                  }}
                >
                  {isCustomColorActive && !customColorDraftsAreValid
                    ? "Reset colors"
                    : hasClosestColorMatches
                      ? "Clear color filter"
                      : "Clear filters"}
                </button>
              </div>
            )}

            {hasClosestColorMatches && (
              <header className="workspace-closest-header">
                <p>CLOSEST MATCHES</p>
                <span>
                  Ranked by perceptual distance · other filters remain exact
                </span>
              </header>
            )}

            {displayedWorkspaceProjects.length > 0 && (
              <ol
                id="workspace-project-list"
                className={`workspace-project-list${hasClosestColorMatches ? " is-closest" : ""}`}
                data-result-kind={hasClosestColorMatches ? "closest" : "exact"}
              >
              {displayedWorkspaceProjects.map((project, projectIndex) => (
                <li key={project.id}>
                  <article
                    className="workspace-project"
                    data-project-id={project.id}
                    data-category={project.category}
                    data-style={project.style}
                    data-size={project.size}
                    data-palette={project.paletteType}
                    data-budget={project.budgetTier}
                  >
                    <figure className="workspace-project-visual">
                      <Image
                        src={project.image}
                        alt={`${project.title}, a conceptual ${project.category.toLowerCase()} study`}
                        width={1536}
                        height={1024}
                        priority={projectIndex === 0}
                        sizes="(max-width: 900px) 100vw, 72vw"
                        style={{ objectPosition: project.imagePosition }}
                      />
                      <figcaption>
                        Concept study {project.studyNumber} / 05
                      </figcaption>
                    </figure>

                    <div className="workspace-project-copy">
                      <div className="workspace-project-heading">
                        <p>{project.style}</p>
                        <span>{project.studyNumber}</span>
                        <h4>{project.title}</h4>
                        {closestColorDistanceByProject.has(project.id) && (
                          <p className="workspace-project-color-distance">
                            Nearest palette · ΔE {" "}
                            {closestColorDistanceByProject
                              .get(project.id)
                              ?.toFixed(1)}
                          </p>
                        )}
                      </div>

                      <dl className="workspace-project-metadata">
                        <div>
                          <dt>Scale</dt>
                          <dd>{project.size}</dd>
                        </div>
                        <div>
                          <dt>Palette</dt>
                          <dd>{project.paletteType}</dd>
                        </div>
                        <div>
                          <dt>Estimated range</dt>
                          <dd>{project.budgetTier}</dd>
                        </div>
                      </dl>

                      <div className="workspace-project-palette" aria-label="Study colors">
                        {project.colors.map((color) => (
                          <span
                            key={color}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>

                      <p className="workspace-project-description">
                        {project.description}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
              </ol>
            )}
            </div>
          </section>
        </section>
      )}

      {activeSelectedProject && (
        <section
          ref={projectBriefRef}
          className="project-brief"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-brief-title"
          aria-describedby="project-brief-concept"
          tabIndex={-1}
        >
          <header className="project-brief-header">
            <p>SARV / Selected Projects</p>
            <button
              ref={projectBriefCloseButtonRef}
              type="button"
              onClick={closeSelectedProject}
            >
              <span aria-hidden="true">←</span>
              Back to Selected Projects
            </button>
            <p>
              {String(activeSelectedProjectIndex! + 1).padStart(2, "0")} / 03
            </p>
          </header>

          <div className="project-brief-title">
            <p>Editorial project brief</p>
            <h2 id="project-brief-title">{activeSelectedProject.name}</h2>
            <p>{activeSelectedProject.style}</p>
          </div>

          <div className="project-brief-visual" aria-label={`${activeSelectedProject.name} image set`}>
            {[
              ["arrival", "Arrival and architectural context"],
              ["interior", "Interior and integrated joinery"],
              ["detail", "Material and junction detail"],
            ].map(([view, label]) => (
              <figure key={view} className={`project-brief-image is-${view}`}>
                <Image
                  src={activeSelectedProject.image}
                  alt={`${activeSelectedProject.name}: ${label}`}
                  fill
                  priority={view === "arrival"}
                  sizes={view === "arrival" ? "(max-width: 760px) 100vw, 62vw" : "(max-width: 760px) 100vw, 38vw"}
                />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="project-brief-information">
            <dl className="project-brief-facts">
              <div>
                <dt>Type</dt>
                <dd>{activeSelectedProject.type}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{activeSelectedProject.location}</dd>
              </div>
              <div>
                <dt>Approximate area</dt>
                <dd>{activeSelectedProject.area}</dd>
              </div>
              <div>
                <dt>Style</dt>
                <dd>{activeSelectedProject.style}</dd>
              </div>
            </dl>

            <div className="project-brief-narrative">
              <article>
                <p>01 / Scope</p>
                <p>{activeSelectedProject.scope}</p>
              </article>
              <article>
                <p>02 / Materials</p>
                <p>{activeSelectedProject.materials}</p>
              </article>
              <article>
                <p>03 / Palette</p>
                <p>{activeSelectedProject.palette}</p>
              </article>
              <article>
                <p>04 / Concept</p>
                <p id="project-brief-concept">{activeSelectedProject.concept}</p>
              </article>
              <article>
                <p>05 / Execution</p>
                <p>{activeSelectedProject.execution}</p>
              </article>
            </div>
          </div>

          <footer className="project-brief-footer">
            <p>Concept imagery / not a completed client commission</p>
            <button type="button" onClick={closeSelectedProject}>
              Return to project index <span aria-hidden="true">↑</span>
            </button>
          </footer>
        </section>
      )}
    </main>
  );
}
