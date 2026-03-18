import { SCREEN, scale } from './layout';

const gapScale = SCREEN.height / 844;

export const GAME_CONFIG = {
  GRAVITY: 0.32,
  JUMP_FORCE: -6.4,
  OBSTACLE_SPEED: 3.4,
  OBSTACLE_GAP: Math.round(148 * gapScale),
  OBSTACLE_WIDTH: Math.round(scale(58)),
  OBSTACLE_SPAWN_INTERVAL: 1250,
  SPEED_INCREMENT: 0.00012,
  TAP_SPEED_BOOST: 0.035,
  TAP_SPEED_DECAY: 0.988,
  MAX_TAP_SPEED_BONUS: 0.45,
  MAX_SPEED_MULTIPLIER: 4.2,
  POLE_PASS_SPEED_KICK: 0.04,
  POLE_SPEED_DECAY: 0.991,
  MAX_POLE_SPEED_BONUS: 0.6,
  CHARACTER_SIZE: Math.round(SCREEN.width * 0.13),
  HITBOX_SHRINK: 0.80,
  CHARACTER_X_POSITION: 0.22,
  CLOUD_COUNT: 5,
  FRAME_RATE: 16,
  VELOCITY_DAMPING: 0.985,
  MAX_FALL_VELOCITY: 4.0,
  FALL_DRAG: 0.948,
  PHASE_SWITCH_INTERVAL: 6,
  SLOW_SPEED_MULT: 0.5,
  FAST_SPEED_MULT: 1.05,
  SLOW_GRAVITY: 0.24,
  FAST_GRAVITY: 0.36,
  SLOW_JUMP: -5.6,
  FAST_JUMP: -6.8,
  SLOW_GAP: Math.round(172 * gapScale),
  FAST_GAP: Math.round(138 * gapScale),
  PHASE_TRANSITION_FRAMES: 35,
  FIRST_PHASE_THRESHOLD: 2,
  CALM_LOCK_THRESHOLD: 3,
  CALM_DURATION: 3,
  CRUISE_BOB_AMPLITUDE: 0.35,
  CRUISE_BOB_FREQUENCY: 0.04,
  CRUISE_MOMENTUM_DAMPING: 0.975,
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
    slowGravity: 0.18,
    fastGravity: 0.25,
    slowJump: -5.0,
    fastJump: -5.8,
    slowGap: 174,
    fastGap: 164,
    slowSpeedMult: 0.54,
    fastSpeedMult: 0.84,
    spawnInterval: 1500,
    phaseInterval: 5,
    color: '#7EC850',
  },
  {
    level: 2,
    name: 'CRUISE',
    scoreThreshold: 5,
    slowGravity: 0.21,
    fastGravity: 0.29,
    slowJump: -5.3,
    fastJump: -6.2,
    slowGap: 166,
    fastGap: 156,
    slowSpeedMult: 0.58,
    fastSpeedMult: 0.90,
    spawnInterval: 1400,
    phaseInterval: 5,
    color: '#5B9BD5',
  },
  {
    level: 3,
    name: 'FLOW',
    scoreThreshold: 10,
    slowGravity: 0.25,
    fastGravity: 0.33,
    slowJump: -5.6,
    fastJump: -6.6,
    slowGap: 156,
    fastGap: 148,
    slowSpeedMult: 0.62,
    fastSpeedMult: 0.96,
    spawnInterval: 1320,
    phaseInterval: 5,
    color: '#FFD84A',
  },
  {
    level: 4,
    name: 'TURBO',
    scoreThreshold: 16,
    slowGravity: 0.29,
    fastGravity: 0.38,
    slowJump: -5.9,
    fastJump: -7.0,
    slowGap: 146,
    fastGap: 138,
    slowSpeedMult: 0.66,
    fastSpeedMult: 1.02,
    spawnInterval: 1240,
    phaseInterval: 6,
    color: '#FFA94D',
  },
  {
    level: 5,
    name: 'BEAST',
    scoreThreshold: 24,
    slowGravity: 0.32,
    fastGravity: 0.42,
    slowJump: -6.2,
    fastJump: -7.4,
    slowGap: 138,
    fastGap: 130,
    slowSpeedMult: 0.72,
    fastSpeedMult: 1.10,
    spawnInterval: 1160,
    phaseInterval: 6,
    color: '#FF6B6B',
  },
  {
    level: 6,
    name: 'INSANE',
    scoreThreshold: 35,
    slowGravity: 0.35,
    fastGravity: 0.46,
    slowJump: -6.5,
    fastJump: -7.9,
    slowGap: 130,
    fastGap: 124,
    slowSpeedMult: 0.76,
    fastSpeedMult: 1.18,
    spawnInterval: 1080,
    phaseInterval: 7,
    color: '#B57EDC',
  },
  {
    level: 7,
    name: 'DEMON',
    scoreThreshold: 50,
    slowGravity: 0.38,
    fastGravity: 0.50,
    slowJump: -6.8,
    fastJump: -8.4,
    slowGap: 123,
    fastGap: 118,
    slowSpeedMult: 0.82,
    fastSpeedMult: 1.26,
    spawnInterval: 1000,
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
