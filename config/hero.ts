// Hero config.
//
// DEFAULT: loads /public/models/woman.glb. If it fails to load, the hero falls back to the
// portrait at /public/images/ambassador.jpg.
//
// NEXT_PUBLIC_MODEL_URL    override the GLB path/URL
// NEXT_PUBLIC_MODEL_STYLE  'marble' (default: white stone that warms into skin as you scroll) | 'native' (keep the GLB's own materials)
// NEXT_PUBLIC_MODEL_CROP   'auto' | 'always' | 'never' (mid-chest cut for full-body meshes)
// NEXT_PUBLIC_USE_PORTRAIT '1' to force the portrait instead of the GLB
export const MODEL_URL: string = process.env.NEXT_PUBLIC_MODEL_URL || '/models/woman.glb';
export const PORTRAIT_URL: string = process.env.NEXT_PUBLIC_PORTRAIT_URL || '/images/ambassador.jpg';
export const USE_PORTRAIT: boolean = process.env.NEXT_PUBLIC_USE_PORTRAIT === '1';
export const MODEL_STYLE: 'marble' | 'native' = process.env.NEXT_PUBLIC_MODEL_STYLE === 'native' ? 'native' : 'marble';
export const MARBLE_COLOR = '#eceef3';
export const SKIN_COLOR = '#b98260';

export type CropMode = 'auto' | 'always' | 'never';
const rawCrop = process.env.NEXT_PUBLIC_MODEL_CROP;
export const CROP_MODE: CropMode = rawCrop === 'always' || rawCrop === 'never' ? rawCrop : 'auto';

export type Stage = {
  key: string;
  title: string;
  product: string;
  blurb: string;
  image: string;
  tint: string;
  emissive: string;
  glow: number;
  roughness: number;
  aura: string;
  bg: [string, string];
};

export const STAGES: Stage[] = [
  { key: 'cleanse', title: 'Cleanse', product: 'Gentle Cleanser', blurb: 'Dull, congested skin. We start by clearing the canvas.', image: '/images/orbit/1.jpg', tint: '#d8d2c8', emissive: '#000000', glow: 0, roughness: 0.95, aura: '#d9d2c3', bg: ['#ECE7DC', '#D8D2C4'] },
  { key: 'hydrate', title: 'Hydrate', product: 'Hydra Glow Facial', blurb: 'Water-light hydration. Skin turns dewy and soft.', image: '/images/orbit/2.jpg', tint: '#cfe8ea', emissive: '#2a6f78', glow: 0.12, roughness: 0.45, aura: '#8fe0ea', bg: ['#E3F1F0', '#BFDDDD'] },
  { key: 'brighten', title: 'Brighten', product: 'Glow Serum', blurb: 'Vitamin C lifts tone and brings back radiance.', image: '/images/orbit/3.jpg', tint: '#fbe6b8', emissive: '#a9701a', glow: 0.22, roughness: 0.4, aura: '#ffd27a', bg: ['#F8EBCB', '#EBCF94'] },
  { key: 'calm', title: 'Calm', product: 'Aromatherapy Session', blurb: 'Lavender and soft oils. Stress and redness settle.', image: '/images/orbit/4.jpg', tint: '#dcd2f0', emissive: '#4b3a86', glow: 0.14, roughness: 0.5, aura: '#cdb8ff', bg: ['#EAE3F6', '#CFC3E8'] },
  { key: 'bloom', title: 'Bloom', product: 'Signature Facial', blurb: 'The full ritual. Skin that glows from within.', image: '/images/orbit/5.jpg', tint: '#ffd9d6', emissive: '#b04a62', glow: 0.28, roughness: 0.35, aura: '#ffb3c6', bg: ['#F8E1E0', '#EDB7BC'] },
];
