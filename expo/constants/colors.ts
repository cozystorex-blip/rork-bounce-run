export const GameColors = {
  skyTop: '#4BA3D4',
  skyBottom: '#87CEEB',
  ground: '#8B6914',
  groundTop: '#5D8A2D',
  groundAccent: '#4A7023',
  uiDark: '#1A1A2E',
  uiLight: '#FFFFFF',
  uiGold: '#FFD84A',
  uiGoldDark: '#D4920B',
  uiGreen: '#2A8A4A',
  uiRed: '#E84545',
  uiBlue: '#4BA3D4',
  overlayDark: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(255,255,255,0.92)',
  cardBg: 'rgba(255,255,255,0.95)',
  shadowColor: '#000',
} as const;

export const SkyGradientColors = {
  default: { top: '#4BA3D4', bottom: '#87CEEB' },
  sunset: { top: '#FF6B35', bottom: '#FFB347' },
  neon: { top: '#0A0A1A', bottom: '#1A0A2E' },
  dawn: { top: '#FF9A9E', bottom: '#FECFEF' },
} as const;
