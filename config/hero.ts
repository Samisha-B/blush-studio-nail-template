// Hero 3D config. The woman transforms through these stages as you scroll.
//
// MODEL: put your GLB at /public/models/woman.glb (default) or set
// NEXT_PUBLIC_MODEL_URL to any URL. If the file is missing the site still works
// (orbit cards, sparkles and text still animate; the figure is simply not drawn).
//
// CROP: NEXT_PUBLIC_MODEL_CROP = 'auto' | 'always' | 'never'
//   auto   -> full-body models are cut at mid-chest, bust models are left alone
//   always -> always cut at mid-chest, never -> never cut
export const MODEL_URL: string = process.env.NEXT_PUBLIC_MODEL_URL || '/models/woman.glb';

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

// tint is applied very lightly (skin keeps its natural warm tone); the visible change
// is skin finish (matte -> dewy), inner glow, aura light, sparkles and background.
export const STAGES: Stage[] = [
  { key: 'cleanse', title: 'Cleanse', product: 'Gentle Cleanser', blurb: 'Dull, congested skin. We start by clearing the canvas.', image: '/images/orbit/1.jpg', tint: '#c9c2b8', emissive: '#000000', glow: 0, roughness: 0.95, aura: '#d9d2c3', bg: ['#ECE7DC', '#D8D2C4'] },
  { key: 'hydrate', title: 'Hydrate', product: 'Hydra Glow Facial', blurb: 'Water-light hydration. Skin turns dewy and soft.', image: '/images/orbit/2.jpg', tint: '#9fd3d8', emissive: '#2a6f78', glow: 0.12, roughness: 0.45, aura: '#8fe0ea', bg: ['#E3F1F0', '#BFDDDD'] },
  { key: 'brighten', title: 'Brighten', product: 'Glow Serum', blurb: 'Vitamin C lifts tone and brings back radiance.', image: '/images/orbit/3.jpg', tint: '#f3d18a', emissive: '#a9701a', glow: 0.22, roughness: 0.4, aura: '#ffd27a', bg: ['#F8EBCB', '#EBCF94'] },
  { key: 'calm', title: 'Calm', product: 'Aromatherapy Session', blurb: 'Lavender and soft oils. Stress and redness settle.', image: '/images/orbit/4.jpg', tint: '#b9a7dd', emissive: '#4b3a86', glow: 0.14, roughness: 0.5, aura: '#cdb8ff', bg: ['#EAE3F6', '#CFC3E8'] },
  { key: 'bloom', title: 'Bloom', product: 'Signature Facial', blurb: 'The full ritual. Skin that glows from within.', image: '/images/orbit/5.jpg', tint: '#f2b6b8', emissive: '#b04a62', glow: 0.28, roughness: 0.35, aura: '#ffb3c6', bg: ['#F8E1E0', '#EDB7BC'] },
];
