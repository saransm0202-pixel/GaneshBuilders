export interface SpecRow {
  label: string;
  value: string;
}

export interface PackageSpec {
  structure: SpecRow[];
  finishes: SpecRow[];
  fittings: SpecRow[];
  includes: string[];
}

export interface EstimatePackage {
  id: 'essential' | 'premium' | 'luxury' | 'custom';
  name: string;
  rate: number;
  tier: string;
  icon: string;
}

export interface ExtraItem {
  id: string;
  label: string;
  unit: string;
  rate: number;
  fixed: boolean;
  placeholder: string;
}

export interface PhaseSplit {
  label: string;
  pct: number;
  color: string;
}

export interface FloorConfig {
  id: string;
  label: string;
  count: number;
  months: number;
  icon: string;
}

export const ESTIMATE_PACKAGES: EstimatePackage[] = [
  { id: 'essential', name: 'Essential', rate: 1799, tier: 'Smart Budget', icon: '🏠' },
  { id: 'premium', name: 'Premium', rate: 2099, tier: 'Most Chosen', icon: '✨' },
  { id: 'luxury', name: 'Luxury', rate: 2499, tier: 'Top Tier', icon: '👑' },
  { id: 'custom', name: 'Customize', rate: 2999, tier: 'Your Plan', icon: '🎨' },
];

export const PACKAGE_SPECS: Record<EstimatePackage['id'], PackageSpec> = {
  essential: {
    structure: [
      { label: 'Steel', value: 'ISI-grade, any reputed mill' },
      { label: 'Cement', value: 'ISI-grade, any reputed mill' },
      { label: 'RCC Mix', value: 'M20' },
      { label: 'Basement Height', value: 'Up to 2 ft' },
      { label: 'Ceiling Height', value: '9 ft' },
      { label: 'Waterproofing', value: 'Branded treatment' },
      { label: 'Plastering', value: 'P-sand' },
    ],
    finishes: [
      { label: 'Living / Dining Tiles', value: "2'×2', up to ₹45/sqft" },
      { label: 'Bedroom & Kitchen Tiles', value: 'Up to ₹45/sqft' },
      { label: 'Interior Paint', value: 'ISI emulsion, 2 coats' },
      { label: 'Exterior Paint', value: 'Weatherproof emulsion' },
      { label: 'Interior Putty', value: 'Wall putty' },
      { label: 'Elevation Design', value: 'Not included' },
      { label: 'Drawings', value: '2D floor plan' },
    ],
    fittings: [
      { label: 'Main Door', value: 'Readymade teak-finish frame' },
      { label: 'Windows', value: "Aluminium, 3'×4'" },
      { label: 'Internal Doors', value: 'Flush doors' },
      { label: 'Wiring', value: 'ISI-grade' },
      { label: 'Switches', value: 'ISI-grade modular' },
      { label: 'CP Fittings', value: 'Allowance up to ₹7,000' },
      { label: 'Plumbing Pipes', value: 'ISI-grade PVC/CPVC' },
    ],
    includes: ['2D Floor Plan', 'Lofts & Shelves', 'Site Engineer'],
  },
  premium: {
    structure: [
      { label: 'Steel', value: 'Leading ISI brands (Fe500D)' },
      { label: 'Cement', value: 'Leading ISI brands (OPC 53)' },
      { label: 'RCC Mix', value: 'M20 / M25 as per design' },
      { label: 'Basement Height', value: 'Up to 3 ft' },
      { label: 'Ceiling Height', value: '9.5 ft' },
      { label: 'Waterproofing', value: 'Branded + anti-termite' },
      { label: 'Plastering', value: 'P-sand, smooth finish' },
    ],
    finishes: [
      { label: 'Living / Dining Tiles', value: "4'×2', up to ₹90/sqft" },
      { label: 'Bedroom & Kitchen Tiles', value: 'Up to ₹75/sqft' },
      { label: 'Interior Paint', value: 'Premium emulsion + putty' },
      { label: 'Exterior Paint', value: 'Primer + weatherproof coat' },
      { label: 'Kitchen', value: 'Modular-style platform' },
      { label: 'Elevation Design', value: '3D elevation included' },
      { label: 'Structural Drawing', value: 'Included' },
    ],
    fittings: [
      { label: 'Main Door', value: 'Teakwood frame, designer shutter' },
      { label: 'Windows', value: "UPVC sliding, 4'×4'" },
      { label: 'Internal Doors', value: 'Laminated flush doors' },
      { label: 'Wiring', value: 'Branded FR-grade' },
      { label: 'Switches', value: 'Premium modular series' },
      { label: 'CP Fittings', value: 'Allowance up to ₹18,000' },
      { label: 'Plumbing Pipes', value: 'Branded CPVC' },
    ],
    includes: ['2D Floor Plan', '3D Elevation', 'MS Stair Railing', '1,000L Water Tank', 'Rain Water Harvesting'],
  },
  luxury: {
    structure: [
      { label: 'Steel', value: 'Top-tier brands (TATA / JSW class)' },
      { label: 'Cement', value: 'Top-tier brands (Ultra / Ramco class)' },
      { label: 'RCC Mix', value: 'M25' },
      { label: 'Basement Height', value: 'Up to 4.5 ft' },
      { label: 'Ceiling Height', value: '10.5 ft' },
      { label: 'Waterproofing', value: 'Premium membrane system' },
      { label: 'Plastering', value: 'River sand, fine finish' },
    ],
    finishes: [
      { label: 'Living / Dining Tiles', value: "6'×4' porcelain, up to ₹150/sqft" },
      { label: 'Bedroom & Kitchen Tiles', value: 'Up to ₹120/sqft' },
      { label: 'Interior Paint', value: 'Royale-class emulsion + ceiling putty' },
      { label: 'Exterior Paint', value: 'Ultima-class weather coat' },
      { label: 'Kitchen', value: 'Full modular work' },
      { label: 'Design Service', value: 'Full interior 3D + layout' },
      { label: 'Structural Drawing', value: 'Included + soil test' },
    ],
    fittings: [
      { label: 'Main Door', value: 'Seasoned teakwood, 3.6ft × 8ft' },
      { label: 'Windows', value: "UPVC 3-track with mesh, 6'×4'" },
      { label: 'Internal Doors', value: 'Designer flush / skin doors' },
      { label: 'Wiring', value: 'Premium brands, copper-rich' },
      { label: 'Switches', value: 'International brand series' },
      { label: 'CP Fittings', value: 'Allowance up to ₹40,000' },
      { label: 'Sanitary Ware', value: 'Wall-hung, concealed cistern' },
    ],
    includes: [
      'Full Interior 3D',
      'Structural Design',
      'Soil Testing',
      'SS Glass Railing',
      '2,000L Sintex Tank',
      'Rain Water Harvesting',
      'Landscaping Basics',
    ],
  },
  custom: {
    structure: [
      { label: 'Steel & Cement', value: 'Your choice of brands' },
      { label: 'RCC Mix', value: 'As per structural design' },
      { label: 'Heights & Layout', value: 'Fully bespoke' },
      { label: 'Special Structures', value: 'Duplex / multi-storey' },
      { label: 'Vastu Compliance', value: 'On request' },
      { label: 'Site Planning', value: 'Design-build consultancy' },
      { label: 'Approvals Support', value: 'Guidance included' },
    ],
    finishes: [
      { label: 'Tiles & Stone', value: 'Curated with you' },
      { label: 'Paints & Textures', value: 'Brand of your choice' },
      { label: 'Kitchen', value: 'Custom modular design' },
      { label: 'Interiors', value: 'Architect-designed' },
      { label: 'Facade', value: 'Custom elevation design' },
      { label: '3D Visualisation', value: 'Included' },
      { label: 'Smart Home', value: 'Readiness & automation' },
    ],
    fittings: [
      { label: 'Doors & Windows', value: 'Premium, your selection' },
      { label: 'Sanitary & CP', value: 'International brands' },
      { label: 'Lighting Design', value: 'Designer scheme' },
      { label: 'Wiring & Switches', value: 'Premium brands' },
      { label: 'Home Automation', value: 'Integrated planning' },
      { label: 'Lift Provision', value: 'Future-ready' },
      { label: 'Warranty', value: 'Tailored in contract' },
    ],
    includes: [
      'Free Design Consultation',
      'Custom 2D & 3D Designs',
      'Material Brand Selection',
      'Flexible Budget Planning',
      'Vastu / Feng Shui Adjustments',
      'Dedicated Project Manager',
    ],
  },
};

export const EXTRA_ITEMS: ExtraItem[] = [
  { id: 'compound', label: 'Compound Wall', unit: 'rft', rate: 2200, fixed: false, placeholder: 'Length in rft' },
  { id: 'sump', label: 'Underground Sump', unit: 'litre', rate: 32, fixed: false, placeholder: 'Capacity in litres' },
  { id: 'septic', label: 'Septic Tank', unit: 'litre', rate: 28, fixed: false, placeholder: 'Capacity in litres' },
  { id: 'oht', label: 'Overhead Concrete Tank', unit: 'litre', rate: 34, fixed: false, placeholder: 'Capacity in litres' },
  { id: 'solar', label: 'Solar Rooftop (3 kW)', unit: '', rate: 145000, fixed: true, placeholder: '' },
  { id: 'gate', label: 'Main Gate (MS / Sliding)', unit: '', rate: 65000, fixed: true, placeholder: '' },
  { id: 'cctv', label: 'CCTV & Security Wiring', unit: '', rate: 28000, fixed: true, placeholder: '' },
  { id: 'lift', label: 'Home Lift (4-person)', unit: '', rate: 750000, fixed: true, placeholder: '' },
];

export const PHASE_SPLITS: PhaseSplit[] = [
  { label: 'Foundation & Excavation', pct: 20, color: '#ff8a3d' },
  { label: 'RCC Structure & Columns', pct: 13, color: '#ef4444' },
  { label: 'Masonry & Block Work', pct: 12, color: '#a855f7' },
  { label: 'Waterproofing & Terrace', pct: 6, color: '#14b8a6' },
  { label: 'Flooring & Tiling', pct: 10, color: '#f59e0b' },
  { label: 'Doors & Windows', pct: 8, color: '#3b82f6' },
  { label: 'Plumbing & Sanitary', pct: 7, color: '#22c55e' },
  { label: 'Electrical & Wiring', pct: 7, color: '#eab308' },
  { label: 'Painting & Finishing', pct: 8, color: '#ec4899' },
  { label: 'Miscellaneous', pct: 9, color: '#64748b' },
];

export const FLOOR_CONFIGS: FloorConfig[] = [
  { id: 'G', label: 'Ground Floor Only', count: 1, months: 12, icon: '🏡' },
  { id: 'G+1', label: 'Ground + 1', count: 2, months: 16, icon: '🏠' },
  { id: 'G+2', label: 'Ground + 2', count: 3, months: 20, icon: '🏢' },
  { id: 'G+3', label: 'Ground + 3', count: 4, months: 24, icon: '🏛️' },
];
