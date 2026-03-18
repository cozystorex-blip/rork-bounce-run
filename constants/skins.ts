export interface MovementProfile {
  flapForceMultiplier: number;
  gravityMultiplier: number;
  fallDamping: number;
  flapSquashX: number;
  flapSquashY: number;
  flapSquashDuration: number;
  flapSpringFriction: number;
  flapSpringTension: number;
  wobbleAmount: number;
  wobbleDuration: number;
  riseSmoothing: number;
}

export interface SkinData {
  id: string;
  name: string;
  personality: string;
  bodyColor: string;
  bodyDark: string;
  eyeStyle: 'normal' | 'angry' | 'goggles' | 'sparkle' | 'intense';
  mouthStyle: 'smirk' | 'grin' | 'tongue' | 'cute' | 'fierce';
  hatColor: string;
  hatBand: string;
  hatStyle: 'builder' | 'hood' | 'spiky' | 'bow' | 'ninja';
  accentColor: string;
  cheekColor: string;
  locked: boolean;
  unlockRequirement: number;
  labelColor: string;
  labelBg: string;
  speechLine: string;
  price: number;
  armColor?: string;
  hasChain?: boolean;
  hasGlasses?: boolean;
  hasCape?: boolean;
  capeColor?: string;
  maskColor?: string;
  chestLetter?: string;
  chestLetterBg?: string;
  mapAffinity: string;
  movement: MovementProfile;
}

export const SKINS: SkinData[] = [
  {
    id: 'hero',
    name: 'Blaze',
    personality: 'The fearless one',
    bodyColor: '#FF6B35',
    bodyDark: '#D4501A',
    eyeStyle: 'intense',
    mouthStyle: 'grin',
    hatColor: '#1A1A2E',
    hatBand: '#FF4444',
    hatStyle: 'ninja',
    accentColor: '#FF9955',
    cheekColor: '#FFAA77',
    locked: false,
    unlockRequirement: 0,
    labelColor: '#FFFFFF',
    labelBg: '#FF4422',
    speechLine: "Let's gooo!",
    price: 0,
    armColor: '#E05A28',
    hasChain: true,
    hasCape: true,
    capeColor: '#FF4444',
    chestLetter: '🔥',
    chestLetterBg: '#FFD84A',
    mapAffinity: 'park',
    movement: {
      flapForceMultiplier: 1.18,
      gravityMultiplier: 1.14,
      fallDamping: 0.965,
      flapSquashX: 0.68,
      flapSquashY: 1.28,
      flapSquashDuration: 18,
      flapSpringFriction: 2.2,
      flapSpringTension: 230,
      wobbleAmount: 0,
      wobbleDuration: 0,
      riseSmoothing: 0.97,
    },
  },
  {
    id: 'shadow',
    name: 'Shady',
    personality: 'The mischievous one',
    bodyColor: '#8B6BBF',
    bodyDark: '#6A4E9A',
    eyeStyle: 'angry',
    mouthStyle: 'smirk',
    hatColor: '#5A3D80',
    hatBand: '#422D66',
    hatStyle: 'hood',
    accentColor: '#AB8EE0',
    cheekColor: '#C4A8F0',
    locked: true,
    unlockRequirement: 3,
    labelColor: '#FFFFFF',
    labelBg: '#6A4E9A',
    speechLine: 'Hehe, catch me!',
    price: 75,
    armColor: '#7A5BAD',
    mapAffinity: 'gotham',
    movement: {
      flapForceMultiplier: 1.02,
      gravityMultiplier: 0.93,
      fallDamping: 0.993,
      flapSquashX: 0.88,
      flapSquashY: 1.08,
      flapSquashDuration: 58,
      flapSpringFriction: 6.5,
      flapSpringTension: 90,
      wobbleAmount: 1,
      wobbleDuration: 280,
      riseSmoothing: 1.0,
    },
  },
  {
    id: 'tech',
    name: 'Gizmo',
    personality: 'The happy nerd',
    bodyColor: '#55BB33',
    bodyDark: '#44991E',
    eyeStyle: 'sparkle',
    mouthStyle: 'tongue',
    hatColor: '#99AABB',
    hatBand: '#778899',
    hatStyle: 'spiky',
    accentColor: '#77DD55',
    cheekColor: '#99EE77',
    locked: true,
    unlockRequirement: 5,
    labelColor: '#2D2D2D',
    labelBg: '#55BB33',
    speechLine: 'Woohoo! Science!',
    price: 100,
    armColor: '#4AAA25',
    hasGlasses: true,
    mapAffinity: 'park',
    movement: {
      flapForceMultiplier: 1.0,
      gravityMultiplier: 1.0,
      fallDamping: 0.978,
      flapSquashX: 0.78,
      flapSquashY: 1.18,
      flapSquashDuration: 30,
      flapSpringFriction: 2.8,
      flapSpringTension: 145,
      wobbleAmount: 7,
      wobbleDuration: 180,
      riseSmoothing: 0.82,
    },
  },
  {
    id: 'aqua',
    name: 'Bubbles',
    personality: 'The bubbly one',
    bodyColor: '#FF88B8',
    bodyDark: '#DD5588',
    eyeStyle: 'sparkle',
    mouthStyle: 'tongue',
    hatColor: '#CC55EE',
    hatBand: '#AA33CC',
    hatStyle: 'bow',
    accentColor: '#FFB8D8',
    cheekColor: '#FFCCDD',
    locked: true,
    unlockRequirement: 10,
    labelColor: '#FFFFFF',
    labelBg: '#DD5588',
    speechLine: 'Yayyy! So fun!',
    price: 150,
    armColor: '#EE77AA',
    hasGlasses: true,
    mapAffinity: 'park',
    movement: {
      flapForceMultiplier: 0.88,
      gravityMultiplier: 0.82,
      fallDamping: 0.948,
      flapSquashX: 0.94,
      flapSquashY: 1.03,
      flapSquashDuration: 80,
      flapSpringFriction: 8,
      flapSpringTension: 65,
      wobbleAmount: 2,
      wobbleDuration: 400,
      riseSmoothing: 0.78,
    },
  },
  {
    id: 'star',
    name: 'Bolt',
    personality: 'The super hero',
    bodyColor: '#4499EE',
    bodyDark: '#2277CC',
    eyeStyle: 'intense',
    mouthStyle: 'grin',
    hatColor: '#EE3333',
    hatBand: '#CC1111',
    hatStyle: 'ninja',
    accentColor: '#FFD84A',
    cheekColor: '#88BBFF',
    locked: true,
    unlockRequirement: 25,
    labelColor: '#FFFFFF',
    labelBg: '#2255BB',
    speechLine: 'SUPER BLOB GO!',
    price: 300,
    armColor: '#3388DD',
    hasCape: true,
    capeColor: '#EE2222',
    maskColor: '#1A1A2E',
    chestLetter: '⚡',
    chestLetterBg: '#FFD84A',
    mapAffinity: 'gotham',
    movement: {
      flapForceMultiplier: 1.1,
      gravityMultiplier: 1.06,
      fallDamping: 0.976,
      flapSquashX: 0.74,
      flapSquashY: 1.22,
      flapSquashDuration: 24,
      flapSpringFriction: 2.8,
      flapSpringTension: 185,
      wobbleAmount: 1.5,
      wobbleDuration: 160,
      riseSmoothing: 0.93,
    },
  },
];

export const DEFAULT_MOVEMENT: MovementProfile = {
  flapForceMultiplier: 1.0,
  gravityMultiplier: 1.0,
  fallDamping: 0.985,
  flapSquashX: 0.85,
  flapSquashY: 1.1,
  flapSquashDuration: 40,
  flapSpringFriction: 5,
  flapSpringTension: 140,
  wobbleAmount: 0,
  wobbleDuration: 0,
  riseSmoothing: 1.0,
};
