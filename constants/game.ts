import { SCREEN, scale } from './layout';

const gapScale = SCREEN.height / 844;

export const GAME_CONFIG = {
  GRAVITY: 0.37,
  JUMP_FORCE: -7.3,
  OBSTACLE_SPEED: 2.9,
  OBSTACLE_GAP: Math.round(148 * gapScale),
  OBSTACLE_WIDTH: Math.round(scale(58)),
  OBSTACLE_SPAWN_INTERVAL: 1250,
  SPEED_INCREMENT: 0.00015,
  TAP_SPEED_BOOST: 0.038,
  TAP_SPEED_DECAY: 0.985,
  MAX_TAP_SPEED_BONUS: 0.55,
  MAX_SPEED_MULTIPLIER: 4.5,
  POLE_PASS_SPEED_KICK: 0.042,
  POLE_SPEED_DECAY: 0.992,
  MAX_POLE_SPEED_BONUS: 0.7,
  CHARACTER_SIZE: Math.round(SCREEN.width * 0.13),
  HITBOX_SHRINK: 0.80,
  CHARACTER_X_POSITION: 0.22,
  CLOUD_COUNT: 5,
  FRAME_RATE: 16,
  VELOCITY_DAMPING: 0.991,
  MAX_FALL_VELOCITY: 4.8,
  FALL_DRAG: 0.968,
  PHASE_SWITCH_INTERVAL: 6,
  SLOW_SPEED_MULT: 0.5,
  FAST_SPEED_MULT: 1.05,
  SLOW_GRAVITY: 0.28,
  FAST_GRAVITY: 0.42,
  SLOW_JUMP: -6.2,
  FAST_JUMP: -7.8,
  SLOW_GAP: Math.round(166 * gapScale),
  FAST_GAP: Math.round(138 * gapScale),
  PHASE_TRANSITION_FRAMES: 35,
  FIRST_PHASE_THRESHOLD: 2,
  CALM_LOCK_THRESHOLD: 3,
  CALM_DURATION: 3,
  CRUISE_HOVER_FORCE: -0.12,
  CRUISE_HOVER_PERIOD: 120,
  CRUISE_DAMPING: 0.975,
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
    slowGravity: 0.20,
    fastGravity: 0.28,
    slowJump: -5.6,
    fastJump: -6.4,
    slowGap: 168,
    fastGap: 158,
    slowSpeedMult: 0.50,
    fastSpeedMult: 0.82,
    spawnInterval: 1500,
    phaseInterval: 5,
    color: '#7EC850',
  },
  {
    level: 2,
    name: 'CRUISE',
    scoreThreshold: 5,
    slowGravity: 0.24,
    fastGravity: 0.32,
    slowJump: -5.9,
    fastJump: -6.8,
    slowGap: 160,
    fastGap: 150,
    slowSpeedMult: 0.55,
    fastSpeedMult: 0.88,
    spawnInterval: 1400,
    phaseInterval: 5,
    color: '#5B9BD5',
  },
  {
    level: 3,
    name: 'FLOW',
    scoreThreshold: 10,
    slowGravity: 0.28,
    fastGravity: 0.37,
    slowJump: -6.2,
    fastJump: -7.2,
    slowGap: 150,
    fastGap: 142,
    slowSpeedMult: 0.60,
    fastSpeedMult: 0.95,
    spawnInterval: 1320,
    phaseInterval: 5,
    color: '#FFD84A',
  },
  {
    level: 4,
    name: 'TURBO',
    scoreThreshold: 16,
    slowGravity: 0.32,
    fastGravity: 0.42,
    slowJump: -6.5,
    fastJump: -7.6,
    slowGap: 140,
    fastGap: 133,
    slowSpeedMult: 0.65,
    fastSpeedMult: 1.02,
    spawnInterval: 1240,
    phaseInterval: 6,
    color: '#FFA94D',
  },
  {
    level: 5,
    name: 'BEAST',
    scoreThreshold: 24,
    slowGravity: 0.36,
    fastGravity: 0.47,
    slowJump: -6.7,
    fastJump: -8.0,
    slowGap: 132,
    fastGap: 126,
    slowSpeedMult: 0.70,
    fastSpeedMult: 1.10,
    spawnInterval: 1160,
    phaseInterval: 6,
    color: '#FF6B6B',
  },
  {
    level: 6,
    name: 'INSANE',
    scoreThreshold: 35,
    slowGravity: 0.39,
    fastGravity: 0.52,
    slowJump: -7.0,
    fastJump: -8.5,
    slowGap: 124,
    fastGap: 118,
    slowSpeedMult: 0.75,
    fastSpeedMult: 1.18,
    spawnInterval: 1080,
    phaseInterval: 7,
    color: '#B57EDC',
  },
  {
    level: 7,
    name: 'DEMON',
    scoreThreshold: 50,
    slowGravity: 0.42,
    fastGravity: 0.56,
    slowJump: -7.3,
    fastJump: -9.0,
    slowGap: 118,
    fastGap: 112,
    slowSpeedMult: 0.80,
    fastSpeedMult: 1.28,
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
