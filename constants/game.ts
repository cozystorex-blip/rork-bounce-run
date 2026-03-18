import { SCREEN, scale } from './layout';

const gapScale = SCREEN.height / 844;

export const GAME_CONFIG = {
  GRAVITY: 0.37,
  JUMP_FORCE: -7.3,
  OBSTACLE_SPEED: 2.9,
  OBSTACLE_GAP: Math.round(138 * gapScale),
  OBSTACLE_WIDTH: Math.round(scale(58)),
  OBSTACLE_SPAWN_INTERVAL: 1250,
  SPEED_INCREMENT: 0.00012,
  TAP_SPEED_BOOST: 0.042,
  TAP_SPEED_DECAY: 0.985,
  MAX_TAP_SPEED_BONUS: 0.55,
  MAX_SPEED_MULTIPLIER: 1.65,
  CHARACTER_SIZE: Math.round(SCREEN.width * 0.13),
  HITBOX_SHRINK: 0.90,
  CHARACTER_X_POSITION: 0.22,
  CLOUD_COUNT: 5,
  FRAME_RATE: 16,
  VELOCITY_DAMPING: 0.991,
  MAX_FALL_VELOCITY: 5.2,
  FALL_DRAG: 0.968,
  PHASE_SWITCH_INTERVAL: 6,
  SLOW_SPEED_MULT: 0.5,
  FAST_SPEED_MULT: 1.05,
  SLOW_GRAVITY: 0.28,
  FAST_GRAVITY: 0.42,
  SLOW_JUMP: -6.2,
  FAST_JUMP: -7.8,
  SLOW_GAP: Math.round(158 * gapScale),
  FAST_GAP: Math.round(122 * gapScale),
  PHASE_TRANSITION_FRAMES: 35,
  FIRST_PHASE_THRESHOLD: 2,
  CALM_LOCK_THRESHOLD: 3,
  CALM_DURATION: 3,
  CRUISE_BOB_AMPLITUDE: 0.38,
  CRUISE_BOB_SPEED: 0.045,
};

export interface LevelConfig {
  level: number;
  name: string;
  scoreThreshold: number;
  slowGravity: number;
  fastGravity: number;
  slowJump: number;
  fastJump: number;
  slowGap: number;
  fastGap: number;
  slowSpeedMult: number;
  fastSpeedMult: number;
  spawnInterval: number;
  phaseInterval: number;
  color: string;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'CHILL',
    scoreThreshold: 0,
    slowGravity: 0.22,
    fastGravity: 0.30,
    slowJump: -5.6,
    fastJump: -6.5,
    slowGap: 155,
    fastGap: 140,
    slowSpeedMult: 0.50,
    fastSpeedMult: 0.82,
    spawnInterval: 1450,
    phaseInterval: 5,
    color: '#7EC850',
  },
  {
    level: 2,
    name: 'CRUISE',
    scoreThreshold: 5,
    slowGravity: 0.26,
    fastGravity: 0.35,
    slowJump: -5.9,
    fastJump: -6.9,
    slowGap: 146,
    fastGap: 130,
    slowSpeedMult: 0.55,
    fastSpeedMult: 0.90,
    spawnInterval: 1360,
    phaseInterval: 5,
    color: '#5B9BD5',
  },
  {
    level: 3,
    name: 'FLOW',
    scoreThreshold: 10,
    slowGravity: 0.30,
    fastGravity: 0.40,
    slowJump: -6.2,
    fastJump: -7.3,
    slowGap: 136,
    fastGap: 122,
    slowSpeedMult: 0.60,
    fastSpeedMult: 0.98,
    spawnInterval: 1280,
    phaseInterval: 5,
    color: '#FFD84A',
  },
  {
    level: 4,
    name: 'TURBO',
    scoreThreshold: 16,
    slowGravity: 0.34,
    fastGravity: 0.45,
    slowJump: -6.5,
    fastJump: -7.8,
    slowGap: 126,
    fastGap: 114,
    slowSpeedMult: 0.65,
    fastSpeedMult: 1.06,
    spawnInterval: 1180,
    phaseInterval: 6,
    color: '#FFA94D',
  },
  {
    level: 5,
    name: 'BEAST',
    scoreThreshold: 24,
    slowGravity: 0.37,
    fastGravity: 0.50,
    slowJump: -6.8,
    fastJump: -8.2,
    slowGap: 118,
    fastGap: 106,
    slowSpeedMult: 0.70,
    fastSpeedMult: 1.14,
    spawnInterval: 1100,
    phaseInterval: 6,
    color: '#FF6B6B',
  },
  {
    level: 6,
    name: 'INSANE',
    scoreThreshold: 35,
    slowGravity: 0.40,
    fastGravity: 0.54,
    slowJump: -7.1,
    fastJump: -8.7,
    slowGap: 112,
    fastGap: 100,
    slowSpeedMult: 0.75,
    fastSpeedMult: 1.22,
    spawnInterval: 1020,
    phaseInterval: 7,
    color: '#B57EDC',
  },
  {
    level: 7,
    name: 'DEMON',
    scoreThreshold: 50,
    slowGravity: 0.43,
    fastGravity: 0.58,
    slowJump: -7.4,
    fastJump: -9.2,
    slowGap: 106,
    fastGap: 94,
    slowSpeedMult: 0.80,
    fastSpeedMult: 1.32,
    spawnInterval: 940,
    phaseInterval: 7,
    color: '#E8453C',
  },
];

export const OBSTACLE_TUNING = {
  GAP_CENTER_MIN_PADDING: 80,
  GAP_CENTER_MAX_PADDING: 50,
  PIPE_WIDTH: 58,
  PIPE_CAP_HEIGHT: 18,
  HITBOX_INSET_X: 2,
  HITBOX_INSET_Y: 0,
  PLAYER_FORGIVENESS: 0,
} as const;

export const BLOCK_COLORS = [
  '#FF6B8A',
  '#2DD4A8',
  '#FFB347',
  '#C06CF0',
  '#A8E847',
  '#5BC8F5',
];

export const BLOCK_COLOR_PAIRS: [string, string][] = [
  ['#73BF2E', '#5A9A24'],
  ['#73BF2E', '#5A9A24'],
  ['#73BF2E', '#5A9A24'],
  ['#73BF2E', '#5A9A24'],
  ['#73BF2E', '#5A9A24'],
  ['#73BF2E', '#5A9A24'],
];
