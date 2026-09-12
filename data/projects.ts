export type CategoryId =
  | "kitchen"
  | "wardrobe"
  | "doors"
  | "skirting"
  | "tv-wall"
  | "bathroom-vanity";

export type ProjectStyle =
  | "modern"
  | "neoclassical"
  | "classic"
  | "industrial"
  | "minimal"
  | "contemporary";

export type ProjectSize = "small" | "medium" | "large";
export type PaletteType = "dark" | "white" | "gray";
export type BudgetTier = "100m-500m" | "500m-1b" | "1b-2b";

export type Project = {
  id: string;
  title: string;
  location: string;
  category: CategoryId;
  style: ProjectStyle;
  size: ProjectSize;
  paletteType: PaletteType;
  colors: [string, string];
  budgetTier: BudgetTier;
  tags: string[];
  image: string;
  imagePrompt: string;
};

export type Category = {
  id: CategoryId;
  index: string;
  title: string;
  shortTitle: string;
  description: string;
};

export const categories: Category[] = [
  { id: "kitchen", index: "01", title: "Kitchen", shortTitle: "Kitchen", description: "Cabinetry composed around ritual, light and movement." },
  { id: "wardrobe", index: "02", title: "Wardrobe", shortTitle: "Wardrobe", description: "Storage resolved as quiet interior architecture." },
  { id: "doors", index: "03", title: "Architectural Doors", shortTitle: "Doors", description: "Openings, thresholds and concealed passages." },
  { id: "skirting", index: "04", title: "Skirting", shortTitle: "Skirting", description: "Precise edges that complete the room." },
  { id: "tv-wall", index: "05", title: "TV Wall / Console", shortTitle: "TV Wall", description: "Integrated media walls with measured restraint." },
  { id: "bathroom-vanity", index: "06", title: "Bathroom Vanity", shortTitle: "Vanity", description: "Water-resistant joinery with refined material detail." },
];

const project = (
  value: Omit<Project, "image" | "imagePrompt"> & { visual: string },
): Project => ({
  ...value,
  tags: value.tags.includes(value.budgetTier)
    ? value.tags
    : [...value.tags, value.budgetTier],
  image: `/sarv/categories/${value.category}/${value.id}.webp`,
  imagePrompt: value.visual,
});

// This matrix is the image contract: metadata and the photographic brief are authored together.
export const projects: Project[] = [
  project({ id: "kitchen-01", title: "Nocturne Island", location: "Niavaran", category: "kitchen", style: "modern", size: "large", paletteType: "dark", colors: ["#171717", "#4b3a2f"], budgetTier: "500m-1b", tags: ["kitchen", "modern", "large", "dark", "handleless", "matte", "island", "integrated-appliance", "walnut"], visual: "Large completed modern kitchen, charcoal matte handleless cabinetry, smoked walnut island, pale honed stone, integrated appliances, broad architectural view in soft late-afternoon light." }),
  project({ id: "kitchen-02", title: "Ivory Court", location: "Elahieh", category: "kitchen", style: "neoclassical", size: "medium", paletteType: "white", colors: ["#eeeae1", "#a9855d"], budgetTier: "1b-2b", tags: ["kitchen", "neoclassical", "medium", "white", "framed", "painted-mdf", "brass", "warm-lighting"], visual: "Completed medium neoclassical kitchen, refined ivory framed cabinetry, slim aged-brass details, warm veined stone and realistic fitted hardware, frontal room view in calm daylight." }),
  project({ id: "kitchen-03", title: "Silver Grain", location: "Zafaraniyeh", category: "kitchen", style: "contemporary", size: "large", paletteType: "gray", colors: ["#8d8b86", "#d0ccc2"], budgetTier: "1b-2b", tags: ["kitchen", "contemporary", "large", "gray", "island", "oak", "integrated-lighting", "integrated-appliance"], visual: "Large completed contemporary kitchen, layered greige cabinetry, rift-cut pale oak, sculptural stone island, integrated lighting and appliances, wide corner perspective with believable residential proportions." }),
  project({ id: "kitchen-04", title: "Foundry Kitchen", location: "Velenjak", category: "kitchen", style: "industrial", size: "small", paletteType: "dark", colors: ["#282826", "#765943"], budgetTier: "100m-500m", tags: ["kitchen", "industrial", "small", "dark", "black", "oak", "matte", "open-shelving"], visual: "Compact completed industrial kitchen, black textured cabinetry, warm oak accents, stainless worktop and honest metal shelving, tight urban apartment composition with natural window light." }),
  project({ id: "kitchen-05", title: "Quiet Line", location: "Saadat Abad", category: "kitchen", style: "minimal", size: "medium", paletteType: "white", colors: ["#f0efe9", "#c6b9a5"], budgetTier: "500m-1b", tags: ["kitchen", "minimal", "medium", "white", "handleless", "matte", "hidden-storage", "integrated-appliance"], visual: "Medium completed minimal kitchen, seamless soft-white handleless cabinets, light limestone worktop, concealed appliances and storage, clean side perspective under diffuse morning daylight." }),

  project({ id: "wardrobe-01", title: "Walnut Gallery", location: "Farmanieh", category: "wardrobe", style: "modern", size: "large", paletteType: "dark", colors: ["#31261f", "#8d6a4d"], budgetTier: "1b-2b", tags: ["wardrobe", "modern", "large", "dark", "walnut", "glass", "integrated-lighting", "hidden-storage"], visual: "Large completed modern walk-in wardrobe, dark walnut veneer, smoked glass doors, integrated warm lighting and precise drawers, wide axial view photographed like a finished architectural project." }),
  project({ id: "wardrobe-02", title: "Linen Room", location: "Shahrak-e Gharb", category: "wardrobe", style: "neoclassical", size: "medium", paletteType: "white", colors: ["#eeeae2", "#b39a7c"], budgetTier: "500m-1b", tags: ["wardrobe", "neoclassical", "medium", "white", "framed", "painted-mdf", "brass", "warm-lighting"], visual: "Medium dressing room with completed ivory neoclassical wardrobes, subtle framed panels, restrained brass pulls, integrated bench and warm domestic daylight, believable joinery detailing." }),
  project({ id: "wardrobe-03", title: "Concrete Fold", location: "Pardis", category: "wardrobe", style: "industrial", size: "small", paletteType: "gray", colors: ["#6f706d", "#31312f"], budgetTier: "100m-500m", tags: ["wardrobe", "industrial", "small", "gray", "metal", "oak", "matte", "sliding"], visual: "Compact completed industrial wardrobe in a small bedroom, graphite metal frames, gray panels and raw oak inserts, sliding doors, realistic fittings and crisp oblique camera angle." }),
  project({ id: "wardrobe-04", title: "Paper White", location: "Mirdamad", category: "wardrobe", style: "minimal", size: "large", paletteType: "white", colors: ["#f3f2ed", "#ddd7cb"], budgetTier: "1b-2b", tags: ["wardrobe", "minimal", "large", "white", "handleless", "painted-mdf", "hidden-storage", "integrated-lighting"], visual: "Wall-length completed minimal wardrobe, paper-white flush panels, recessed shadow gaps, concealed dressing niche and integrated lighting, spacious serene bedroom with exact architectural lines." }),
  project({ id: "wardrobe-05", title: "Graphite Dressing", location: "Lavasan", category: "wardrobe", style: "classic", size: "medium", paletteType: "dark", colors: ["#373634", "#9a7d5e"], budgetTier: "500m-1b", tags: ["wardrobe", "classic", "medium", "dark", "framed", "glass", "brass", "integrated-lighting"], visual: "Completed dark classic dressing room, graphite framed cabinetry, clear glass upper doors, antique brass hardware and tailored internal storage, medium room photographed with restrained warm lighting." }),

  project({ id: "doors-01", title: "Shadow Pivot", location: "Darrous", category: "doors", style: "modern", size: "large", paletteType: "dark", colors: ["#242321", "#725640"], budgetTier: "1b-2b", tags: ["doors", "modern", "large", "dark", "walnut", "pivot", "hidden-hardware", "matte"], visual: "Large completed modern interior with a full-height dark walnut pivot door, flush shadow gaps and hidden hardware, wide architectural hall view with soft directional daylight." }),
  project({ id: "doors-02", title: "Ivory Passage", location: "Kamraniyeh", category: "doors", style: "neoclassical", size: "medium", paletteType: "white", colors: ["#efede6", "#aa8b68"], budgetTier: "500m-1b", tags: ["doors", "neoclassical", "medium", "white", "framed", "painted-mdf", "brass", "architrave"], visual: "Completed neoclassical apartment passage with tall ivory painted doors, delicate framed profiles and aged brass handles, balanced frontal composition and realistic construction joins." }),
  project({ id: "doors-03", title: "Steel Threshold", location: "Qeytarieh", category: "doors", style: "industrial", size: "small", paletteType: "gray", colors: ["#5d5e5b", "#20211f"], budgetTier: "100m-500m", tags: ["doors", "industrial", "small", "gray", "glass", "metal", "sliding", "black"], visual: "Compact loft interior with completed industrial steel-and-ribbed-glass sliding door, gray plaster walls and black hardware, intimate side angle with honest material texture." }),
  project({ id: "doors-04", title: "Silent Plane", location: "Ajudaniyeh", category: "doors", style: "minimal", size: "large", paletteType: "white", colors: ["#f1f0eb", "#c7c2b8"], budgetTier: "1b-2b", tags: ["doors", "minimal", "large", "white", "flush", "hidden-hardware", "painted-mdf", "shadow-gap"], visual: "Large minimalist residence corridor with completed full-height flush white doors, invisible frames, continuous shadow gaps and limestone floor, long one-point perspective in diffused daylight." }),
  project({ id: "doors-05", title: "Oak Portal", location: "Chitgar", category: "doors", style: "classic", size: "medium", paletteType: "dark", colors: ["#4b3323", "#9a714e"], budgetTier: "500m-1b", tags: ["doors", "classic", "medium", "dark", "oak", "framed", "brass", "architrave"], visual: "Completed classic oak double doors in a medium residential entry, deep brown stain, proportioned panels and discreet brass hardware, professional symmetrical architectural photograph." }),

  project({ id: "skirting-01", title: "Black Datum", location: "Jordan", category: "skirting", style: "modern", size: "large", paletteType: "dark", colors: ["#1c1c1b", "#696865"], budgetTier: "500m-1b", tags: ["skirting", "modern", "large", "dark", "black", "flush", "shadow-gap", "matte"], visual: "Wide completed modern living interior focused on a precise flush black skirting datum beneath gray wall panels, believable corners and door junctions, low architectural camera angle." }),
  project({ id: "skirting-02", title: "Ivory Profile", location: "Shemiran", category: "skirting", style: "classic", size: "medium", paletteType: "white", colors: ["#f0eee7", "#cabfae"], budgetTier: "100m-500m", tags: ["skirting", "classic", "medium", "white", "painted-mdf", "profiled", "warm-lighting"], visual: "Completed classic room with elegant ivory profiled MDF skirting, oak parquet and paneled walls, medium-scale corner composition showing precise mitres and realistic installation." }),
  project({ id: "skirting-03", title: "Concrete Edge", location: "Ekhtiarieh", category: "skirting", style: "industrial", size: "small", paletteType: "gray", colors: ["#777772", "#3c3d3b"], budgetTier: "100m-500m", tags: ["skirting", "industrial", "small", "gray", "metal", "shadow-gap", "concrete"], visual: "Small industrial apartment detail with slim graphite metal skirting meeting gray concrete walls and terrazzo floor, tight low-angle photo emphasizing clean installed junctions." }),
  project({ id: "skirting-04", title: "Vanishing Line", location: "Mahmoodieh", category: "skirting", style: "minimal", size: "large", paletteType: "white", colors: ["#eeeeea", "#d7d3ca"], budgetTier: "1b-2b", tags: ["skirting", "minimal", "large", "white", "flush", "shadow-gap", "painted-mdf"], visual: "Large serene minimal interior with recessed white flush skirting and continuous shadow line, pale microcement walls and limestone floor, expansive daylight composition." }),
  project({ id: "skirting-05", title: "Graphite Ribbon", location: "Vanak", category: "skirting", style: "contemporary", size: "medium", paletteType: "dark", colors: ["#31312f", "#8e8172"], budgetTier: "500m-1b", tags: ["skirting", "contemporary", "medium", "dark", "metal", "flush", "integrated-lighting"], visual: "Completed contemporary hallway with dark graphite skirting ribbon integrated into walnut wall panels, subtle low-level light at selected sections, medium oblique view with precise detailing." }),

  project({ id: "tv-wall-01", title: "Monolith Media", location: "Fereshteh", category: "tv-wall", style: "modern", size: "large", paletteType: "dark", colors: ["#20201f", "#76563e"], budgetTier: "1b-2b", tags: ["tv-wall", "modern", "large", "dark", "walnut", "stone", "hidden-storage", "integrated-lighting"], visual: "Large completed modern living room media wall, dark stone monolith, walnut cabinetry, concealed storage and warm integrated lighting, broad straight-on professional photograph." }),
  project({ id: "tv-wall-02", title: "Ivory Salon", location: "Pasdaran", category: "tv-wall", style: "classic", size: "medium", paletteType: "white", colors: ["#eeece5", "#a88e70"], budgetTier: "500m-1b", tags: ["tv-wall", "classic", "medium", "white", "framed", "painted-mdf", "brass", "hidden-storage"], visual: "Completed medium classic salon with ivory framed TV wall cabinetry, discreet brass detail and closed base storage, symmetrical residential view with warm natural light." }),
  project({ id: "tv-wall-03", title: "Workshop Frame", location: "Yousef Abad", category: "tv-wall", style: "industrial", size: "small", paletteType: "gray", colors: ["#646561", "#272826"], budgetTier: "100m-500m", tags: ["tv-wall", "industrial", "small", "gray", "metal", "oak", "open-shelving", "matte"], visual: "Compact completed industrial TV console, black steel frame, charcoal panels and oak open shelving against gray plaster, small urban living room in angled daylight." }),
  project({ id: "tv-wall-04", title: "Soft Horizon", location: "Dezashib", category: "tv-wall", style: "minimal", size: "large", paletteType: "white", colors: ["#f1f0eb", "#d7cdbc"], budgetTier: "1b-2b", tags: ["tv-wall", "minimal", "large", "white", "handleless", "stone", "hidden-storage", "integrated-lighting"], visual: "Large minimal completed media wall, seamless warm-white cabinetry, slim floating limestone console and concealed storage, calm wide composition with soft daylight." }),
  project({ id: "tv-wall-05", title: "Silver Alcove", location: "Andarzgoo", category: "tv-wall", style: "contemporary", size: "medium", paletteType: "dark", colors: ["#383836", "#8b7762"], budgetTier: "500m-1b", tags: ["tv-wall", "contemporary", "medium", "dark", "glass", "oak", "integrated-lighting", "hidden-storage"], visual: "Completed contemporary media alcove, graphite lacquer, dark oak and fluted glass display niches, integrated warm lighting, medium living room viewed from a three-quarter angle." }),

  project({ id: "bathroom-vanity-01", title: "Basalt Basin", location: "Lavasan", category: "bathroom-vanity", style: "modern", size: "large", paletteType: "dark", colors: ["#252523", "#6e5948"], budgetTier: "500m-1b", tags: ["bathroom-vanity", "modern", "large", "dark", "walnut", "stone", "handleless", "integrated-lighting"], visual: "Large completed modern bathroom, floating dark walnut double vanity, basalt stone counter, handleless fronts and soft mirror lighting, wide architectural photograph with realistic plumbing clearances." }),
  project({ id: "bathroom-vanity-02", title: "Porcelain Cabinet", location: "Gholhak", category: "bathroom-vanity", style: "neoclassical", size: "medium", paletteType: "white", colors: ["#efede6", "#b39a7a"], budgetTier: "500m-1b", tags: ["bathroom-vanity", "neoclassical", "medium", "white", "framed", "painted-mdf", "brass", "stone"], visual: "Medium completed neoclassical bathroom vanity, ivory framed moisture-resistant cabinetry, pale stone top and restrained brass fittings, balanced daylight composition with believable joints." }),
  project({ id: "bathroom-vanity-03", title: "Graphite Wash", location: "Jannat Abad", category: "bathroom-vanity", style: "industrial", size: "small", paletteType: "gray", colors: ["#676866", "#252624"], budgetTier: "100m-500m", tags: ["bathroom-vanity", "industrial", "small", "gray", "metal", "concrete", "matte", "open-shelf"], visual: "Small completed industrial bathroom, compact graphite vanity with black metal frame, concrete basin and open lower shelf, tight realistic room view under soft window light." }),
  project({ id: "bathroom-vanity-04", title: "Quiet Basin", location: "Zaferanieh", category: "bathroom-vanity", style: "minimal", size: "large", paletteType: "white", colors: ["#f2f0e9", "#d5cbbb"], budgetTier: "1b-2b", tags: ["bathroom-vanity", "minimal", "large", "white", "handleless", "stone", "hidden-storage", "integrated-lighting"], visual: "Large serene minimal bathroom with seamless warm-white floating vanity, integrated stone basin, concealed drawers and full-width mirror, soft diffused natural light." }),
  project({ id: "bathroom-vanity-05", title: "Smoked Glass", location: "Niavaran", category: "bathroom-vanity", style: "contemporary", size: "medium", paletteType: "dark", colors: ["#343331", "#8a6c53"], budgetTier: "500m-1b", tags: ["bathroom-vanity", "contemporary", "medium", "dark", "glass", "walnut", "stone", "integrated-lighting"], visual: "Completed contemporary medium bathroom vanity, dark walnut drawers, smoked glass side cabinet, gray stone top and integrated warm lighting, refined three-quarter architectural view." }),
];

export const styleLabels: Record<ProjectStyle, string> = {
  modern: "Modern",
  neoclassical: "Neoclassical",
  classic: "Classic",
  industrial: "Industrial",
  minimal: "Minimal",
  contemporary: "Contemporary",
};

export const budgetLabels: Record<BudgetTier, string> = {
  "100m-500m": "100–500M Toman",
  "500m-1b": "500M–1B Toman",
  "1b-2b": "1–2B Toman",
};

export function validateProjects(values: Project[]) {
  const ids = new Set<string>();
  const errors: string[] = [];
  for (const item of values) {
    if (ids.has(item.id)) errors.push(`Duplicate id: ${item.id}`);
    ids.add(item.id);
    for (const required of [item.category, item.style, item.size, item.paletteType, item.budgetTier]) {
      if (!item.tags.includes(required)) errors.push(`${item.id} is missing tag: ${required}`);
    }
  }
  for (const category of categories) {
    const count = values.filter((item) => item.category === category.id).length;
    if (count !== 5) errors.push(`${category.id} has ${count} projects, expected 5`);
  }
  return errors;
}
