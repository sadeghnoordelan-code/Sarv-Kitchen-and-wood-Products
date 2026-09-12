"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const displayedProgress = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateTarget = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const range = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const scrollPosition = window.scrollY + hero.getBoundingClientRect().top;
      targetProgress.current = Math.min(
        1,
        Math.max(0, (window.scrollY - scrollPosition) / range),
      );
    };
    const animate = () => {
      const difference = targetProgress.current - currentProgress.current;
      currentProgress.current += difference * 0.068;
      if (Math.abs(difference) < 0.00035) currentProgress.current = targetProgress.current;
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const nextTime = currentProgress.current * Math.max(video.duration - 0.05, 0);
        if (Math.abs(video.currentTime - nextTime) > 0.012) video.currentTime = nextTime;
      }
      if (Math.abs(displayedProgress.current - currentProgress.current) > 0.002) {
        displayedProgress.current = currentProgress.current;
        setProgress(currentProgress.current);
      }
      frame = requestAnimationFrame(animate);
    };
    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    frame = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="top" ref={heroRef} className="hero" aria-label="SARV introduction">
      <div className="hero-sticky">
        <video
          ref={videoRef}
          className="hero-video"
          src="/sarv/hero/sarv-hero.mp4"
          muted
          playsInline
          preload="auto"
          aria-label="SARV material and craft film"
        />
        <div className="hero-shade" />
        <div className="hero-frame" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Design · Manufacture · Installation</p>
          <h1>
            Spaces shaped through
            <br />precision, material <i>and</i> craft.
          </h1>
          <button
            className="text-link light"
            type="button"
            onClick={() => document.querySelector("#categories")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore projects <ArrowDownRight />
          </button>
        </div>
        <div className="hero-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(progress, 0.015)})` }} />
        </div>
        <div className="scrub-label" aria-hidden="true">
          <span>{Math.round(progress * 100).toString().padStart(2, "0")}</span>
          <small>Scroll to shape the film</small>
        </div>
      </div>
    </section>
  );
}
