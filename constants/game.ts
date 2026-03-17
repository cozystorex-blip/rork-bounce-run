import { SCREEN, scale } from './layout';

const gapScale = SCREEN.height / 844;

export const GAME_CONFIG = {
  GRAVITY: 0.37,
  JUMP_FORCE: -7.3,
  OBSTACLE_SPEED: 3.25,
  OBSTACLE_GAP: Math.round(132 * gapScale),
  OBSTACLE_WIDTH: Math.round(scale(58)),
  OBSTACLE_SPAWN_INTERVAL: 1250,
  SPEED_INCREMENT: 0.00015,
  TAP_SPEED_BOOST: 0.056,
  TAP_SPEED_DECAY: 0.989,
  MAX_TAP_SPEED_BONUS: 0.75,
  MAX_SPEED_MULTIPLIER: 1.8,
  CHARACTER_SIZE: Math.round(SCREEN.width * 0.13),
  HITBOX_SHRINK: 0.90,
  CHARACTER_X_POSITION: 0.22,
  CLOUD_COUNT: 5,
  FRAME_RATE: 16,
  VELOCITY_DAMPING: 0.991,
  MAX_FALL_VELOCITY: 6.0,
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
    slowGravity: 0.26,
    fastGravity: 0.36,
    slowJump: -6.0,
    fastJump: -7.2,
    slowGap: 148,
    fastGap: 130,
    slowSpeedMult: 0.55,
    fastSpeedMult: 0.9,
    spawnInterval: 1350,
    phaseInterval: 5,
    color: '#7EC850',
  },
  {
    level: 2,
    name: 'CRUISE',
    scoreThreshold: 5,
    slowGravity: 0.30,
    fastGravity: 0.40,
    slowJump: -6.3,
    fastJump: -7.5,
    slowGap: 140,
    fastGap: 122,
    slowSpeedMult: 0.60,
    fastSpeedMult: 0.98,
    spawnInterval: 1260,
    phaseInterval: 5,
    color: '#5B9BD5',
  },
  {
    level: 3,
    name: 'FLOW',
    scoreThreshold: 10,
    slowGravity: 0.34,
    fastGravity: 0.44,
    slowJump: -6.5,
    fastJump: -7.9,
    slowGap: 130,
    fastGap: 116,
    slowSpeedMult: 0.65,
    fastSpeedMult: 1.04,
    spawnInterval: 1180,
    phaseInterval: 5,
    color: '#FFD84A',
  },
  {
    level: 4,
    name: 'TURBO',
    scoreThreshold: 16,
    slowGravity: 0.37,
    fastGravity: 0.49,
    slowJump: -6.8,
    fastJump: -8.3,
    slowGap: 122,
    fastGap: 109,
    slowSpeedMult: 0.70,
    fastSpeedMult: 1.10,
    spawnInterval: 1100,
    phaseInterval: 6,
    color: '#FFA94D',
  },
  {
    level: 5,
    name: 'BEAST',
    scoreThreshold: 24,
    slowGravity: 0.40,
    fastGravity: 0.53,
    slowJump: -7.0,
    fastJump: -8.7,
    slowGap: 115,
    fastGap: 102,
    slowSpeedMult: 0.75,
    fastSpeedMult: 1.18,
    spawnInterval: 1030,
    phaseInterval: 6,
    color: '#FF6B6B',
  },
  {
    level: 6,
    name: 'INSANE',
    scoreThreshold: 35,
    slowGravity: 0.43,
    fastGravity: 0.57,
    slowJump: -7.3,
    fastJump: -9.2,
    slowGap: 108,
    fastGap: 96,
    slowSpeedMult: 0.80,
    fastSpeedMult: 1.26,
    spawnInterval: 960,
    phaseInterval: 7,
    color: '#B57EDC',
  },
  {
    level: 7,
    name: 'DEMON',
    scoreThreshold: 50,
    slowGravity: 0.46,
    fastGravity: 0.62,
    slowJump: -7.6,
    fastJump: -9.6,
    slowGap: 102,
    fastGap: 91,
    slowSpeedMult: 0.85,
    fastSpeedMult: 1.36,
    spawnInterval: 880,
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
