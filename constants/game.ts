import { SCREEN, scale } from './layout';

const gapScale = SCREEN.height / 844;

export const GAME_CONFIG = {
  GRAVITY: 0.37,
  JUMP_FORCE: -7.3,
  OBSTACLE_SPEED: 3.25,
  OBSTACLE_GAP: Math.round(140 * gapScale),
  OBSTACLE_WIDTH: Math.round(scale(58)),
  OBSTACLE_SPAWN_INTERVAL: 1250,
  SPEED_INCREMENT: 0.00015,
  TAP_SPEED_BOOST: 0.042,
  TAP_SPEED_DECAY: 0.992,
  MAX_TAP_SPEED_BONUS: 0.55,
  MAX_SPEED_MULTIPLIER: 4.5,
  POLE_PASS_SPEED_KICK: 0.045,
  POLE_SPEED_DECAY: 0.993,
  MAX_POLE_SPEED_BONUS: 0.7,
  CHARACTER_SIZE: Math.round(SCREEN.width * 0.13),
  HITBOX_SHRINK: 0.80,
  CHARACTER_X_POSITION: 0.22,
  CLOUD_COUNT: 5,
  FRAME_RATE: 16,
  VELOCITY_DAMPING: 0.991,
  MAX_FALL_VELOCITY: 4.8,
  FALL_DRAG: 0.958,
  PHASE_SWITCH_INTERVAL: 6,
  SLOW_SPEED_MULT: 0.5,
  FAST_SPEED_MULT: 1.05,
  SLOW_GRAVITY: 0.28,
  FAST_GRAVITY: 0.42,
  SLOW_JUMP: -6.2,
  FAST_JUMP: -7.8,
  SLOW_GAP: Math.round(166 * gapScale),
  FAST_GAP: Math.round(130 * gapScale),
  PHASE_TRANSITION_FRAMES: 35,
  FIRST_PHASE_THRESHOLD: 2,
  CALM_LOCK_THRESHOLD: 3,
  CALM_DURATION: 3,
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
    slowGap: 168,
    fastGap: 158,
    slowSpeedMult: 0.52,
    fastSpeedMult: 0.82,
    spawnInterval: 1450,
    phaseInterval: 5,
    color: '#7EC850',
  },
  {
    level: 2,
    name: 'CRUISE',
    scoreThreshold: 5,
    slowGravity: 0.25,
    fastGravity: 0.34,
    slowJump: -5.9,
    fastJump: -6.9,
    slowGap: 160,
    fastGap: 150,
    slowSpeedMult: 0.56,
    fastSpeedMult: 0.88,
    spawnInterval: 1360,
    phaseInterval: 5,
    color: '#5B9BD5',
  },
  {
    level: 3,
    name: 'FLOW',
    scoreThreshold: 10,
    slowGravity: 0.29,
    fastGravity: 0.38,
    slowJump: -6.1,
    fastJump: -7.3,
    slowGap: 150,
    fastGap: 142,
    slowSpeedMult: 0.62,
    fastSpeedMult: 0.96,
    spawnInterval: 1280,
    phaseInterval: 5,
    color: '#FFD84A',
  },
  {
    level: 4,
    name: 'TURBO',
    scoreThreshold: 16,
    slowGravity: 0.33,
    fastGravity: 0.44,
    slowJump: -6.4,
    fastJump: -7.7,
    slowGap: 140,
    fastGap: 132,
    slowSpeedMult: 0.66,
    fastSpeedMult: 1.02,
    spawnInterval: 1200,
    phaseInterval: 6,
    color: '#FFA94D',
  },
  {
    level: 5,
    name: 'BEAST',
    scoreThreshold: 24,
    slowGravity: 0.36,
    fastGravity: 0.48,
    slowJump: -6.6,
    fastJump: -8.1,
    slowGap: 132,
    fastGap: 125,
    slowSpeedMult: 0.72,
    fastSpeedMult: 1.10,
    spawnInterval: 1120,
    phaseInterval: 6,
    color: '#FF6B6B',
  },
  {
    level: 6,
    name: 'INSANE',
    scoreThreshold: 35,
    slowGravity: 0.39,
    fastGravity: 0.52,
    slowJump: -6.9,
    fastJump: -8.6,
    slowGap: 124,
    fastGap: 118,
    slowSpeedMult: 0.76,
    fastSpeedMult: 1.18,
    spawnInterval: 1050,
    phaseInterval: 7,
    color: '#B57EDC',
  },
  {
    level: 7,
    name: 'DEMON',
    scoreThreshold: 50,
    slowGravity: 0.42,
    fastGravity: 0.56,
    slowJump: -7.2,
    fastJump: -9.0,
    slowGap: 117,
    fastGap: 112,
    slowSpeedMult: 0.82,
    fastSpeedMult: 1.26,
    spawnInterval: 970,
    phaseInterval: 7,
    color: '#E8453C',
  },
];

export const OBSTACLE_TUNING = {
  GAP_CENTER_MIN_PADDING: 85,
  GAP_CENTER_MAX_PADDING: 55,
  PIPE_WIDTH: 58,
  PIPE_CAP_HEIGHT: 18,
  HITBOX_INSET_X: 2,
  HITBOX_INSET_Y: 0,
  PLAYER_FORGIVENESS: 3,
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
