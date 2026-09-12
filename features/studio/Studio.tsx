"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const teams = [
  ["Factory team", "Manufacturing and production"],
  ["Execution / installation", "Delivery, site installation and adjustment"],
  ["Technical / design", "Design, detailing and production preparation"],
] as const;

const process = [
  ["Site measurement", "We record the architecture, tolerances and service points."],
  ["Design", "Spatial intent is translated into a clear cabinetry system."],
  ["Material selection", "Finishes, hardware and performance are aligned."],
  ["Technical preparation", "Every junction is resolved for production."],
  ["Factory production", "Joinery is cut, finished and assembled under control."],
  ["Quality control", "Dimensions, finish and hardware are checked before dispatch."],
  ["Delivery", "Completed elements are sequenced for the site."],
  ["Installation", "Our team fits, aligns and adjusts every component."],
  ["Handover", "The finished work is inspected with the client."],
] as const;

export function Studio() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <section id="studio" className="studio-section">
      <div className="studio-title">
        <p className="eyebrow">03 — SARV</p>
        <h2>From measured line<br />to <i>finished</i> room.</h2>
      </div>
      <div className="teams-grid">
        {teams.map(([title, description], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="process-layout">
        <div className="process-intro">
          <p className="eyebrow">Process 01—09</p>
          <h3>{process[activeStep][0]}</h3>
          <p>{process[activeStep][1]}</p>
          <div className="process-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(activeStep + 1) / process.length})` }} />
          </div>
        </div>
        <ol className="process-list">
          {process.map(([title], index) => (
            <li key={title} className={index === activeStep ? "active" : ""}>
              <button type="button" onMouseEnter={() => setActiveStep(index)} onFocus={() => setActiveStep(index)} onClick={() => setActiveStep(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>{title}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div id="contact" className="contact-block">
        <p className="eyebrow">04 — Begin</p>
        <h2>Let’s build<br />your <i>space.</i></h2>
        <div className="contact-fields">
          {["Phone — To be provided", "Email — To be provided", "Instagram — To be provided", "Showroom — To be provided", "Factory — To be provided"].map((item) => <span key={item}>{item}</span>)}
        </div>
        <button className="contact-action" type="button" disabled title="Approved contact details are pending">
          Contact details pending <ArrowUpRight />
        </button>
      </div>
    </section>
  );
}
