import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const SCREEN = {
  width,
  height,
  isSmall: height < 700,
  isMedium: height >= 700 && height < 812,
  isLarge: height >= 812,
} as const;

export function wp(percentage: number): number {
  return (percentage / 100) * width;
}

export function hp(percentage: number): number {
  return (percentage / 100) * height;
}

export function scale(size: number): number {
  return (width / BASE_WIDTH) * size;
}

export function verticalScale(size: number): number {
  return (height / BASE_HEIGHT) * size;
}

export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export const PLAYER_SIZE = Math.round(width * 0.14);

export const HUD = {
  pillHeight: verticalScale(38),
  pillPadH: scale(14),
  pillPadV: verticalScale(8),
  pillRadius: scale(20),
  iconSize: scale(15),
  fontSize: moderateScale(13),
  scoreFontSize: moderateScale(22),
  gap: scale(5),
} as const;

export const GROUND_HEIGHT = verticalScale(80);

export const BUTTON = {
  height: verticalScale(56),
  radius: scale(24),
  fontSize: moderateScale(18),
  padH: scale(32),
} as const;

export const CARD = {
  radius: scale(22),
  padH: scale(20),
  padV: verticalScale(16),
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.18,
    shadowRadius: scale(16),
    elevation: 12,
  },
} as const;

export const MODAL = {
  width: Math.min(width * 0.88, 380),
  radius: scale(28),
  padding: scale(22),
} as const;
