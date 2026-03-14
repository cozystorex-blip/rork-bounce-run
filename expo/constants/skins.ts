export interface SkinPhysics {
  flapForceMultiplier: number;
  gravityMultiplier: number;
  fallDamping: number;
  riseSmoothing: number;
  flapSquashX: number;
  flapSquashDuration: number;
  flapSpringFriction: number;
  flapSpringTension: number;
}

export interface SkinDefinition {
  id: string;
  name: string;
  emoji: string;
  bodyColor: string;
  eyeColor: string;
  cheekColor: string;
  accentColor: string;
  price: number;
  physics: SkinPhysics;
}

const DEFAULT_PHYSICS: SkinPhysics = {
  flapForceMultiplier: 1.0,
  gravityMultiplier: 1.0,
  fallDamping: 0.97,
  riseSmoothing: 0.85,
  flapSquashX: 0.82,
  flapSquashDuration: 50,
  flapSpringFriction: 5,
  flapSpringTension: 160,
};

export const SKINS: SkinDefinition[] = [
  {
    id: 'default',
    name: 'Blobby',
    emoji: '😊',
    bodyColor: '#FFD93D',
    eyeColor: '#1A1A2E',
    cheekColor: '#FFB3B3',
    accentColor: '#FFC107',
    price: 0,
    physics: { ...DEFAULT_PHYSICS },
  },
  {
    id: 'sky',
    name: 'Cloudy',
    emoji: '☁️',
    bodyColor: '#87CEEB',
    eyeColor: '#1A3A5C',
    cheekColor: '#B3D9FF',
    accentColor: '#4BA3D4',
    price: 50,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.08, gravityMultiplier: 0.92, riseSmoothing: 0.9 },
  },
  {
    id: 'fire',
    name: 'Blaze',
    emoji: '🔥',
    bodyColor: '#FF6B35',
    eyeColor: '#1A0A00',
    cheekColor: '#FF9A6C',
    accentColor: '#E84545',
    price: 75,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.12, gravityMultiplier: 1.05, fallDamping: 0.96 },
  },
  {
    id: 'ocean',
    name: 'Aqua',
    emoji: '🌊',
    bodyColor: '#00B4D8',
    eyeColor: '#003845',
    cheekColor: '#90E0EF',
    accentColor: '#0077B6',
    price: 75,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 0.95, gravityMultiplier: 0.88, fallDamping: 0.98, riseSmoothing: 0.92 },
  },
  {
    id: 'forest',
    name: 'Mossy',
    emoji: '🌿',
    bodyColor: '#52B788',
    eyeColor: '#1B4332',
    cheekColor: '#95D5B2',
    accentColor: '#2D6A4F',
    price: 100,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.0, gravityMultiplier: 0.95, riseSmoothing: 0.88 },
  },
  {
    id: 'royal',
    name: 'Crown',
    emoji: '👑',
    bodyColor: '#9B59B6',
    eyeColor: '#2C0A3C',
    cheekColor: '#D2A6E8',
    accentColor: '#6C3483',
    price: 150,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.05, gravityMultiplier: 0.98, flapSpringTension: 180 },
  },
  {
    id: 'golden',
    name: 'Midas',
    emoji: '✨',
    bodyColor: '#FFD700',
    eyeColor: '#5C4300',
    cheekColor: '#FFF3B0',
    accentColor: '#DAA520',
    price: 200,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.1, gravityMultiplier: 0.94, riseSmoothing: 0.9, flapSpringFriction: 4 },
  },
  {
    id: 'shadow',
    name: 'Phantom',
    emoji: '👻',
    bodyColor: '#2C2C54',
    eyeColor: '#FF6B6B',
    cheekColor: '#474787',
    accentColor: '#1A1A40',
    price: 250,
    physics: { ...DEFAULT_PHYSICS, flapForceMultiplier: 1.15, gravityMultiplier: 1.08, fallDamping: 0.95, flapSquashX: 0.75 },
  },
];

export function getSkinById(id: string): SkinDefinition {
  return SKINS.find(s => s.id === id) ?? SKINS[0];
}
