export type CategoryId =
  | 'kitchen'
  | 'wardrobe'
  | 'doors'
  | 'skirting'
  | 'tv-console'
  | 'bathroom-vanity';

export type SizeRange = 'compact' | 'medium' | 'large';
export type BudgetTier = 'essential' | 'premium' | 'signature';

export interface ProjectVisual {
  id: string;
  name: string;
  category: CategoryId;
  style: string;
  palettes: string[];
  paletteColors: string[];
  usage?: string;
  size: SizeRange;
  budgetTier: BudgetTier;
  image: string;
  alt: string;
  statement: string;
  materials: string[];
  gallery?: string[];
  selected?: boolean;
}

export interface Category {
  id: CategoryId;
  index: string;
  label: string;
  shortLabel: string;
  descriptor: string;
  image: string;
}

export const categories: Category[] = [
  { id: 'kitchen', index: '01', label: 'Kitchen', shortLabel: 'Kitchens', descriptor: 'Custom kitchens shaped around architecture, material and everyday use.', image: '/sarv/projects/kitchen-minimal-oak.png' },
  { id: 'wardrobe', index: '02', label: 'Wardrobe', shortLabel: 'Wardrobes', descriptor: 'Storage composed as part of the room—from quiet walls to complete dressing spaces.', image: '/sarv/projects/wardrobe-master-walnut.png' },
  { id: 'doors', index: '03', label: 'Doors', shortLabel: 'Doors', descriptor: 'Thresholds with weight, proportion and precisely resolved hardware.', image: '/sarv/projects/door-pivot-walnut.png' },
  { id: 'skirting', index: '04', label: 'Skirting', shortLabel: 'Details', descriptor: 'Wall-base details that make architecture read as one continuous system.', image: '/sarv/projects/skirting-flush-oak.png' },
  { id: 'tv-console', index: '05', label: 'TV Console', shortLabel: 'Living', descriptor: 'Integrated media walls and low joinery calibrated to the living space.', image: '/sarv/projects/tv-console-walnut.png' },
  { id: 'bathroom-vanity', index: '06', label: 'Bathroom Vanity', shortLabel: 'Vanities', descriptor: 'Precise cabinetry made for water, stone, reflection and daily ritual.', image: '/sarv/projects/vanity-oak-microcement.png' },
];

export const palettePresets = [
  { id: 'natural-oak', label: 'Natural Oak', colors: ['#B48D64', '#E4D8C8'] },
  { id: 'warm-walnut', label: 'Warm Walnut', colors: ['#79573D', '#C9B6A2'] },
  { id: 'dark-walnut', label: 'Dark Walnut', colors: ['#4B3427', '#9C826D'] },
  { id: 'white-oak', label: 'White + Oak', colors: ['#F4F1EB', '#AC865F'] },
  { id: 'charcoal', label: 'Charcoal', colors: ['#292929', '#8A8178'] },
  { id: 'warm-beige', label: 'Warm Beige', colors: ['#C8B7A2', '#E9E0D4'] },
  { id: 'soft-gray', label: 'Soft Gray', colors: ['#AAA7A2', '#E1DEDA'] },
] as const;

export const styleOptions = ['modern', 'contemporary', 'minimal', 'neoclassical', 'classic', 'industrial'];
export const wardrobeUsages = ['master bedroom', 'walk-in closet', "children's room", 'guest bedroom', 'entry storage'];

export const projects: ProjectVisual[] = [
  {
    id: 'atelier-kitchen', name: 'Atelier Kitchen', category: 'kitchen', style: 'contemporary',
    palettes: ['warm-walnut', 'dark-walnut'], paletteColors: ['#5B3B29', '#B9A68E'], size: 'large', budgetTier: 'signature',
    image: '/sarv/hero/sarv-hero-walnut.png', alt: 'Full-height walnut cabinetry and pale stone island in a contemporary kitchen',
    statement: 'A continuous walnut wall gathers cooking, storage and the threshold to the living room into one architectural plane.',
    materials: ['American walnut veneer', 'Honed limestone', 'Blackened steel'],
    gallery: ['/sarv/hero/sarv-hero-walnut.png', '/sarv/details/atelier-wide.png', '/sarv/details/atelier-detail.png'], selected: true,
  },
  {
    id: 'oak-court-kitchen', name: 'Oak Court', category: 'kitchen', style: 'minimal',
    palettes: ['natural-oak', 'white-oak'], paletteColors: ['#B18B66', '#F0EBE3'], size: 'medium', budgetTier: 'premium',
    image: '/sarv/projects/kitchen-minimal-oak.png', alt: 'Minimal natural oak and warm-white kitchen with stone island',
    statement: 'Handleless planes and a single stone volume keep a compact kitchen spatially calm.', materials: ['Rift-cut oak', 'Painted MDF', 'Honed stone'],
  },
  {
    id: 'linen-house-kitchen', name: 'Linen House', category: 'kitchen', style: 'neoclassical',
    palettes: ['warm-beige', 'warm-walnut'], paletteColors: ['#C5B29B', '#70503A'], size: 'large', budgetTier: 'signature',
    image: '/sarv/projects/kitchen-neoclassical-beige.png', alt: 'Warm beige neoclassical kitchen with walnut island',
    statement: 'Classical proportion reduced to its essential lines and grounded by a walnut island.', materials: ['Painted timber', 'Walnut veneer', 'Limestone'],
  },
  {
    id: 'kiln-kitchen', name: 'Kiln Kitchen', category: 'kitchen', style: 'industrial',
    palettes: ['charcoal', 'dark-walnut'], paletteColors: ['#2B2927', '#4B3427'], size: 'medium', budgetTier: 'premium',
    image: '/sarv/projects/kitchen-industrial-charcoal.png', alt: 'Industrial charcoal kitchen with glass cabinets and walnut island',
    statement: 'Charred oak, ribbed glass and blackened metal set a deliberately tactile working room.', materials: ['Charred oak', 'Ribbed glass', 'Blackened steel'],
  },
  {
    id: 'garden-kitchen', name: 'Garden Kitchen', category: 'kitchen', style: 'classic',
    palettes: ['white-oak', 'natural-oak'], paletteColors: ['#F1EDE5', '#AC825C'], size: 'large', budgetTier: 'premium',
    image: '/sarv/projects/kitchen-classic-white-oak.png', alt: 'Classic warm-white and oak kitchen with a large island',
    statement: 'A familiar framed language executed with disciplined reveals and contemporary storage.', materials: ['Painted timber', 'Natural oak', 'Brushed brass'],
  },
  {
    id: 'ridge-wardrobe', name: 'Ridge Wardrobe', category: 'wardrobe', style: 'contemporary',
    palettes: ['dark-walnut', 'warm-beige'], paletteColors: ['#493327', '#D8CFC3'], usage: 'master bedroom', size: 'large', budgetTier: 'signature',
    image: '/sarv/projects/wardrobe-master-walnut.png', alt: 'Dark walnut master bedroom wardrobe with fluted glass doors',
    statement: 'Full-height storage, a dressing niche and softly lit glass volumes form the room’s darker edge.', materials: ['Smoked walnut', 'Fluted glass', 'Dark anodized aluminium'],
    gallery: ['/sarv/projects/wardrobe-master-walnut.png', '/sarv/details/ridge-wide.png', '/sarv/details/ridge-detail.png'], selected: true,
  },
  {
    id: 'lightwell-wardrobe', name: 'Lightwell Dressing', category: 'wardrobe', style: 'minimal',
    palettes: ['natural-oak'], paletteColors: ['#B28B62', '#E5D6C5'], usage: 'walk-in closet', size: 'large', budgetTier: 'signature',
    image: '/sarv/projects/wardrobe-walkin-oak.png', alt: 'Large natural oak walk-in wardrobe with central drawer island',
    statement: 'A room of oak storage organized around daylight and a measured central island.', materials: ['Natural oak', 'Clear glass', 'Linen lining'],
  },
  {
    id: 'soft-room', name: 'Soft Room', category: 'wardrobe', style: 'modern',
    palettes: ['soft-gray', 'natural-oak'], paletteColors: ['#AAA7A2', '#B9946E'], usage: "children's room", size: 'medium', budgetTier: 'essential',
    image: '/sarv/projects/wardrobe-child-gray.png', alt: 'Soft gray children’s wardrobe with oak study niche',
    statement: 'Durable storage, open display and a study surface drawn as one adaptable wall.', materials: ['Painted MDF', 'Natural oak', 'Solid timber pulls'],
  },
  {
    id: 'guest-alcove', name: 'Guest Alcove', category: 'wardrobe', style: 'classic',
    palettes: ['white-oak', 'warm-beige'], paletteColors: ['#F0ECE5', '#B5906A'], usage: 'guest bedroom', size: 'medium', budgetTier: 'essential',
    image: '/sarv/projects/wardrobe-guest-white-oak.png', alt: 'Warm-white guest wardrobe with oak luggage alcove',
    statement: 'A quiet storage wall makes room for arrival, luggage and a soft pool of light.', materials: ['Warm-white MDF', 'Oak veneer', 'Woven lining'],
  },
  {
    id: 'threshold-storage', name: 'Threshold Storage', category: 'wardrobe', style: 'industrial',
    palettes: ['charcoal', 'warm-walnut'], paletteColors: ['#262524', '#77533B'], usage: 'entry storage', size: 'compact', budgetTier: 'premium',
    image: '/sarv/projects/wardrobe-entry-charcoal.png', alt: 'Charcoal entry wardrobe with walnut bench and shoe drawer',
    statement: 'Coats, shoes and the daily pause at the door compressed into a precise dark volume.', materials: ['Charcoal oak', 'Walnut', 'Smoked mirror'],
  },
  {
    id: 'pivot-threshold', name: 'Pivot Threshold', category: 'doors', style: 'modern',
    palettes: ['warm-walnut'], paletteColors: ['#725039', '#D7C5AF'], size: 'large', budgetTier: 'signature',
    image: '/sarv/projects/door-pivot-walnut.png', alt: 'Full-height walnut pivot door in a limestone entry',
    statement: 'A tall walnut plane gives the entrance weight without ornament.', materials: ['Quarter-sawn walnut', 'Blackened steel', 'Limestone'],
  },
  {
    id: 'flush-line', name: 'Flush Line', category: 'skirting', style: 'minimal',
    palettes: ['natural-oak', 'warm-beige'], paletteColors: ['#A7835D', '#D9CBBB'], size: 'medium', budgetTier: 'premium',
    image: '/sarv/projects/skirting-flush-oak.png', alt: 'Flush oak skirting meeting plaster and limestone flooring',
    statement: 'The smallest junction organizes the reading of the entire wall.', materials: ['Natural oak', 'Shadow-gap aluminium', 'Limestone'],
  },
  {
    id: 'contour-living', name: 'Contour Living', category: 'tv-console', style: 'modern',
    palettes: ['dark-walnut', 'charcoal'], paletteColors: ['#4A3326', '#272727'], size: 'large', budgetTier: 'signature',
    image: '/sarv/projects/tv-console-walnut.png', alt: 'Long floating walnut TV console and acoustic slatted wall',
    statement: 'Media, acoustic treatment and display dissolve into one long walnut elevation.', materials: ['Dark walnut', 'Acoustic felt', 'Pale limestone'],
    gallery: ['/sarv/projects/tv-console-walnut.png', '/sarv/details/contour-wide.png', '/sarv/details/contour-detail.png'], selected: true,
  },
  {
    id: 'stone-basin', name: 'Stone Basin', category: 'bathroom-vanity', style: 'minimal',
    palettes: ['natural-oak', 'warm-beige'], paletteColors: ['#AE865E', '#CFC1AE'], size: 'compact', budgetTier: 'premium',
    image: '/sarv/projects/vanity-oak-microcement.png', alt: 'Floating oak bathroom vanity with integrated stone basin',
    statement: 'Two aligned drawers sit beneath a continuous basin and mirrored storage plane.', materials: ['Natural oak', 'Cast stone', 'Dark brass'],
  },
];

export const selectedProjects = projects.filter((project) => project.selected);
