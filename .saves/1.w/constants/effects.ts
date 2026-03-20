export type BlobEffectType = 'squeeze' | 'shield' | 'float' | 'burst' | 'ghost' | 'flow';

export interface BlobEffectConfig {
  type: BlobEffectType;
  name: string;
  color: string;
  glowColor: string;
  duration: number;
  icon: string;
  description: string;
}

export const BLOB_EFFECTS: Record<BlobEffectType, BlobEffectConfig> = {
  squeeze: {
    type: 'squeeze',
    name: 'SQUEEZE',
    color: '#FF6BDF',
    glowColor: '#FF6BDF40',
    duration: 300,
    icon: '🫧',
    description: 'Compress through tighter gaps',
  },
  shield: {
    type: 'shield',
    name: 'SHIELD',
    color: '#00D4FF',
    glowColor: '#00D4FF40',
    duration: 360,
    icon: '🛡️',
    description: 'Absorb one hit',
  },
  float: {
    type: 'float',
    name: 'FLOAT',
    color: '#A8FF6B',
    glowColor: '#A8FF6B40',
    duration: 240,
    icon: '🍃',
    description: 'Softer gravity for a while',
  },
  burst: {
    type: 'burst',
    name: 'BURST',
    color: '#FFB020',
    glowColor: '#FFB02040',
    duration: 180,
    icon: '⚡',
    description: 'Extra momentum and energy',
  },
  ghost: {
    type: 'ghost',
    name: 'GHOST',
    color: '#C8B8FF',
    glowColor: '#C8B8FF50',
    duration: 90,
    icon: '👻',
    description: 'Phase through one scrape',
  },
  flow: {
    type: 'flow',
    name: 'FLOW',
    color: '#FFE040',
    glowColor: '#FFE04040',
    duration: 240,
    icon: '✨',
    description: 'Smooth cruise state',
  },
};

export const EFFECT_SPAWN_INTERVAL = 4;
export const EFFECT_PICKUP_RADIUS = 14;
export const EFFECT_COLLECT_DISTANCE = 40;

export const EFFECT_SPAWN_WEIGHTS: BlobEffectType[] = [
  'squeeze', 'squeeze',
  'shield',
  'float', 'float',
  'burst', 'burst',
  'ghost',
  'flow', 'flow',
];

export interface EffectPickup {
  id: number;
  x: number;
  y: number;
  type: BlobEffectType;
  collected: boolean;
}

export interface ActiveBlobEffect {
  type: BlobEffectType;
  config: BlobEffectConfig;
  remaining: number;
  shieldUsed: boolean;
}
