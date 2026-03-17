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
  bellyColor?: string;
  eyeStyle: 'normal' | 'angry' | 'goggles' | 'sparkle' | 'intense';
  eyeColor?: string;
  mouthStyle: 'smirk' | 'grin' | 'tongue' | 'cute' | 'fierce';
  earStyle: 'cat' | 'bear' | 'bunny' | 'fox' | 'pointy';
  earColor?: string;
  earInnerColor?: string;
  noseColor?: string;
  tailStyle?: 'round' | 'fluffy' | 'long' | 'curly';
  tailColor?: string;
  hatColor: string;
  hatBand: string;
  hatStyle: 'builder' | 'hood' | 'spiky' | 'bow' | 'ninja' | 'none';
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
  whiskers?: boolean;
  mapAffinity: string;
  movement: MovementProfile;
}

export const SKINS: SkinData[] = [
  {
    id: 'hero',
    name: 'Blaze',
    personality: 'The fearless fox',
    bodyColor: '#FF6B35',
    bodyDark: '#D4501A',
    bellyColor: '#FFE4CC',
    eyeStyle: 'intense',
    eyeColor: '#2D1A00',
    mouthStyle: 'grin',
    earStyle: 'fox',
    earColor: '#FF6B35',
    earInnerColor: '#FFD4AA',
    noseColor: '#1A1A2E',
    tailStyle: 'fluffy',
    tailColor: '#FF8855',
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
    whiskers: true,
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
    personality: 'The sneaky cat',
    bodyColor: '#8B6BBF',
    bodyDark: '#6A4E9A',
    bellyColor: '#D4C0F0',
    eyeStyle: 'angry',
    eyeColor: '#44FF88',
    mouthStyle: 'smirk',
    earStyle: 'cat',
    earColor: '#8B6BBF',
    earInnerColor: '#C4A8F0',
    noseColor: '#5A3D80',
    tailStyle: 'long',
    tailColor: '#7A5BAD',
    hatColor: '#5A3D80',
    hatBand: '#422D66',
    hatStyle: 'hood',
    accentColor: '#AB8EE0',
    cheekColor: '#C4A8F0',
    locked: false,
    unlockRequirement: 0,
    labelColor: '#FFFFFF',
    labelBg: '#6A4E9A',
    speechLine: 'Hehe, catch me!',
    price: 0,
    armColor: '#7A5BAD',
    whiskers: true,
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
    personality: 'The curious bear',
    bodyColor: '#55BB33',
    bodyDark: '#44991E',
    bellyColor: '#D4F0C0',
    eyeStyle: 'sparkle',
    mouthStyle: 'tongue',
    earStyle: 'bear',
    earColor: '#55BB33',
    earInnerColor: '#99EE77',
    noseColor: '#2D5A1A',
    tailStyle: 'round',
    tailColor: '#44991E',
    hatColor: '#99AABB',
    hatBand: '#778899',
    hatStyle: 'none',
    accentColor: '#77DD55',
    cheekColor: '#99EE77',
    locked: false,
    unlockRequirement: 0,
    labelColor: '#2D2D2D',
    labelBg: '#55BB33',
    speechLine: 'Woohoo! Science!',
    price: 0,
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
    personality: 'The bubbly bunny',
    bodyColor: '#FF88B8',
    bodyDark: '#DD5588',
    bellyColor: '#FFE0EC',
    eyeStyle: 'sparkle',
    mouthStyle: 'cute',
    earStyle: 'bunny',
    earColor: '#FF88B8',
    earInnerColor: '#FFD0E4',
    noseColor: '#EE5588',
    tailStyle: 'round',
    tailColor: '#FFFFFF',
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
    personality: 'The super wolf',
    bodyColor: '#4499EE',
    bodyDark: '#2277CC',
    bellyColor: '#C8E0FF',
    eyeStyle: 'intense',
    eyeColor: '#FFD84A',
    mouthStyle: 'fierce',
    earStyle: 'pointy',
    earColor: '#4499EE',
    earInnerColor: '#88BBFF',
    noseColor: '#1A1A2E',
    tailStyle: 'fluffy',
    tailColor: '#3388DD',
    hatColor: '#EE3333',
    hatBand: '#CC1111',
    hatStyle: 'none',
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
