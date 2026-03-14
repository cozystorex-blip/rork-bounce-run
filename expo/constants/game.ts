import { scale, verticalScale } from '@/constants/layout';

export const GAME_CONFIG = {
  GRAVITY: 0.38,
  JUMP_FORCE: -7.2,
  VELOCITY_DAMPING: 0.992,
  MAX_FALL_VELOCITY: 6.2,
  FALL_DRAG: 0.97,
  CHARACTER_SIZE: scale(48),
  CHARACTER_X_PERCENT: 0.22,
  HITBOX_SHRINK: 0.78,
  OBSTACLE_GAP: verticalScale(180),
  OBSTACLE_SPEED: 3.2,
  OBSTACLE_SPAWN_INTERVAL: 1800,
  GROUND_HEIGHT: verticalScale(80),
  SCORE_PER_OBSTACLE: 1,
  COINS_PER_SCORE: 1,
} as const;

export const OBSTACLE_TUNING = {
  GAP_CENTER_MIN_PADDING: 80,
  GAP_CENTER_MAX_PADDING: 50,
  PIPE_WIDTH: 58,
  PIPE_CAP_HEIGHT: 18,
  HITBOX_INSET_X: 6,
  HITBOX_INSET_Y: 8,
  PLAYER_FORGIVENESS: 4,
} as const;

export const BLOCK_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E67E22', '#34495E',
] as const;

export const BLOCK_COLOR_PAIRS: [string, string][] = [
  ['#D35400', '#E67E22'],
  ['#C0392B', '#E74C3C'],
  ['#2980B9', '#3498DB'],
  ['#27AE60', '#2ECC71'],
  ['#8E44AD', '#9B59B6'],
  ['#16A085', '#1ABC9C'],
  ['#2C3E50', '#34495E'],
  ['#F39C12', '#F1C40F'],
];

export interface LevelConfig {
  level: number;
  scoreThreshold: number;
  fastGap: number;
  fastGravity: number;
  fastJump: number;
  fastSpeed: number;
  label: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, scoreThreshold: 0, fastGap: verticalScale(190), fastGravity: 0.36, fastJump: -7.0, fastSpeed: 2.8, label: 'Easy' },
  { level: 2, scoreThreshold: 5, fastGap: verticalScale(178), fastGravity: 0.38, fastJump: -7.2, fastSpeed: 3.0, label: 'Normal' },
  { level: 3, scoreThreshold: 12, fastGap: verticalScale(168), fastGravity: 0.40, fastJump: -7.4, fastSpeed: 3.3, label: 'Hard' },
  { level: 4, scoreThreshold: 22, fastGap: verticalScale(158), fastGravity: 0.42, fastJump: -7.6, fastSpeed: 3.6, label: 'Expert' },
  { level: 5, scoreThreshold: 35, fastGap: verticalScale(148), fastGravity: 0.44, fastJump: -7.8, fastSpeed: 3.9, label: 'Master' },
  { level: 6, scoreThreshold: 50, fastGap: verticalScale(140), fastGravity: 0.46, fastJump: -8.0, fastSpeed: 4.2, label: 'Legend' },
];

export function getLevelForScore(score: number): LevelConfig {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].scoreThreshold) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
