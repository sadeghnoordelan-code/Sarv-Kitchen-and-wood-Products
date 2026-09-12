export type SelectedProject = {
  id: string;
  index: string;
  title: string;
  location: string;
  type: string;
  area: string;
  style: string;
  scope: string;
  materials: string;
  palette: [string, string, string];
  concept: string;
  execution: string;
  images: string[];
};

export const selectedProjects: SelectedProject[] = [
  {
    id: "cedar-house",
    index: "01",
    title: "Cedar House",
    location: "Northern Tehran",
    type: "Private Residence",
    area: "Approx. 420 m²",
    style: "Contemporary",
    scope: "Full-home cabinetry, architectural wall panels, kitchen and wardrobes",
    materials: "Smoked walnut, honed travertine, matte lacquer, brushed dark metal",
    palette: ["#34271f", "#b2a38f", "#3e4231"],
    concept: "A continuous walnut datum gives the house warmth and order while stone anchors its shared rooms.",
    execution: "Design development, technical detailing, factory production and installation",
    images: [
      "/sarv/selected-projects/cedar-house/cedar-house-01.webp",
      "/sarv/selected-projects/cedar-house/cedar-house-02.webp",
    ],
  },
  {
    id: "pale-courtyard",
    index: "02",
    title: "Pale Courtyard",
    location: "Lavasan",
    type: "Courtyard Residence",
    area: "Approx. 365 m²",
    style: "Minimal",
    scope: "Kitchen, integrated storage, wardrobes and interior doors",
    materials: "Warm-white lacquer, natural oak, pale limestone, clear glass",
    palette: ["#ece8dd", "#b99e7b", "#d3c8b5"],
    concept: "Quiet cabinetry frames the planted court and lets daylight become the primary material.",
    execution: "Site survey, joinery engineering, production, delivery and installation",
    images: [
      "/sarv/selected-projects/pale-courtyard/pale-courtyard-01.webp",
      "/sarv/selected-projects/pale-courtyard/pale-courtyard-02.webp",
    ],
  },
  {
    id: "stone-frame",
    index: "03",
    title: "Stone Frame",
    location: "Central Tehran",
    type: "Urban Penthouse",
    area: "Approx. 210 m²",
    style: "Industrial Contemporary",
    scope: "Media wall, compact kitchen, wardrobes and concealed partitions",
    materials: "Graphite lacquer, gray stone, fluted glass, warm oak",
    palette: ["#292927", "#64605a", "#8b6a4b"],
    concept: "Dark joinery consolidates the compact plan while fluted glass preserves depth and borrowed light.",
    execution: "Technical design, material coordination, fabrication and site fit-out",
    images: [
      "/sarv/selected-projects/stone-frame/stone-frame-01.webp",
      "/sarv/selected-projects/stone-frame/stone-frame-02.webp",
    ],
  },
];
