export interface MapTheme {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  sky: {
    base: string;
    layer1: string;
    layer2: string;
    layer3: string;
    horizonGlow: string;
    horizonOpacity: number;
  };
  ground: {
    top: string;
    bottom: string;
    line: string;
  };
  groundWave: {
    accent: string;
    accentOpacity: number;
    body: string;
    dark: string;
    outline: string;
  };
  clouds: {
    color: string;
    opacity: number;
    visible: boolean;
  };
  bgBuildings: {
    color: string;
    opacity: number;
  };
  obstacles: {
    palettes: {
      body: string;
      light: string;
      lip: string;
      window: string;
      windowLit: string;
      ledge: string;
    }[];
    outline: string;
  };
  blockColorPairs: [string, string][];
  preview: {
    skyTop: string;
    skyBottom: string;
    groundColor: string;
    accentColor: string;
  };
}

export const MAP_THEMES: MapTheme[] = [
  {
    id: 'park',
    name: 'Green Park',
    subtitle: 'Classic vibes',
    icon: '🌿',
    sky: {
      base: '#4BA3D4',
      layer1: '#3A8FC2',
      layer2: '#6BBEE0',
      layer3: '#9AD4EE',
      horizonGlow: '#FFD080',
      horizonOpacity: 0.45,
    },
    ground: {
      top: '#5DA33A',
      bottom: '#4A8A2E',
      line: '#2D5A1A',
    },
    groundWave: {
      accent: '#8ECAE6',
      accentOpacity: 0.4,
      body: '#7EC850',
      dark: '#5DA33A',
      outline: '#2D2D2D',
    },
    clouds: {
      color: 'rgba(255,255,255,0.85)',
      opacity: 1,
      visible: true,
    },
    bgBuildings: {
      color: '#2A4A6A',
      opacity: 0.18,
    },
    obstacles: {
      palettes: [
        { body: '#5B7FA5', light: '#7899BB', lip: '#4A6E94', window: '#FFF9C4', windowLit: '#FFE082', ledge: '#4A6E94' },
        { body: '#8B6B5A', light: '#A6866E', lip: '#7A5A49', window: '#FFFDE7', windowLit: '#FFD54F', ledge: '#7A5A49' },
        { body: '#6B8E7B', light: '#88AB98', lip: '#5A7D6A', window: '#E8F5E9', windowLit: '#A5D6A7', ledge: '#5A7D6A' },
        { body: '#7E6B99', light: '#9885B3', lip: '#6D5A88', window: '#F3E5F5', windowLit: '#CE93D8', ledge: '#6D5A88' },
        { body: '#99756B', light: '#B38F85', lip: '#88645A', window: '#FFF3E0', windowLit: '#FFB74D', ledge: '#88645A' },
        { body: '#6B8899', light: '#85A2B3', lip: '#5A7788', window: '#E0F7FA', windowLit: '#4DD0E1', ledge: '#5A7788' },
      ],
      outline: '#1A1A2E',
    },
    blockColorPairs: [
      ['#73BF2E', '#5A9A24'],
      ['#73BF2E', '#5A9A24'],
      ['#73BF2E', '#5A9A24'],
      ['#73BF2E', '#5A9A24'],
      ['#73BF2E', '#5A9A24'],
      ['#73BF2E', '#5A9A24'],
    ],
    preview: {
      skyTop: '#6BB8D4',
      skyBottom: '#87CEEB',
      groundColor: '#7EC850',
      accentColor: '#5DA33A',
    },
  },
  {
    id: 'gotham',
    name: 'Gotham City',
    subtitle: 'Dark knight mode',
    icon: '🦇',
    sky: {
      base: '#080818',
      layer1: '#0E0E25',
      layer2: '#161638',
      layer3: '#1E1E4A',
      horizonGlow: '#4A2A6A',
      horizonOpacity: 0.5,
    },
    ground: {
      top: '#2A2A3A',
      bottom: '#1A1A28',
      line: '#FFD84A',
    },
    groundWave: {
      accent: '#FFD84A',
      accentOpacity: 0.15,
      body: '#2A2A3A',
      dark: '#1A1A28',
      outline: '#FFD84A',
    },
    clouds: {
      color: 'rgba(60,60,90,0.4)',
      opacity: 0.5,
      visible: true,
    },
    bgBuildings: {
      color: '#0A0A20',
      opacity: 0.55,
    },
    obstacles: {
      palettes: [
        { body: '#1E1E32', light: '#2A2A45', lip: '#15152A', window: '#FFD84A', windowLit: '#FFEB3B', ledge: '#2A2A45' },
        { body: '#252538', light: '#32324A', lip: '#1A1A30', window: '#FFD84A', windowLit: '#FFC107', ledge: '#32324A' },
        { body: '#1A1A2E', light: '#28283E', lip: '#121225', window: '#FFD84A', windowLit: '#FFE082', ledge: '#28283E' },
        { body: '#202035', light: '#2E2E48', lip: '#16162B', window: '#E8C840', windowLit: '#FFD84A', ledge: '#2E2E48' },
        { body: '#181830', light: '#262642', lip: '#101028', window: '#FFD84A', windowLit: '#FFCA28', ledge: '#262642' },
        { body: '#222240', light: '#303055', lip: '#181835', window: '#FFD84A', windowLit: '#FFE57F', ledge: '#303055' },
      ],
      outline: '#FFD84A',
    },
    blockColorPairs: [
      ['#1E1E32', '#15152A'],
      ['#252538', '#1A1A30'],
      ['#1A1A2E', '#121225'],
      ['#202035', '#16162B'],
      ['#181830', '#101028'],
      ['#222240', '#181835'],
    ],
    preview: {
      skyTop: '#0D0D1A',
      skyBottom: '#1A1A35',
      groundColor: '#2A2A3A',
      accentColor: '#FFD84A',
    },
  },
  {
    id: 'neon',
    name: 'Neon District',
    subtitle: 'Cyberpunk vibes',
    icon: '⚡',
    sky: {
      base: '#050515',
      layer1: '#0A0820',
      layer2: '#10102E',
      layer3: '#181545',
      horizonGlow: '#FF2D95',
      horizonOpacity: 0.45,
    },
    ground: {
      top: '#1A0A2E',
      bottom: '#0D0518',
      line: '#00F0FF',
    },
    groundWave: {
      accent: '#FF2D95',
      accentOpacity: 0.2,
      body: '#1A0A2E',
      dark: '#0D0518',
      outline: '#00F0FF',
    },
    clouds: {
      color: 'rgba(0,240,255,0.12)',
      opacity: 0.3,
      visible: true,
    },
    bgBuildings: {
      color: '#120830',
      opacity: 0.65,
    },
    obstacles: {
      palettes: [
        { body: '#1A0A2E', light: '#2A1545', lip: '#120822', window: '#00F0FF', windowLit: '#FF2D95', ledge: '#2A1545' },
        { body: '#150828', light: '#251240', lip: '#0D0518', window: '#FF2D95', windowLit: '#00F0FF', ledge: '#251240' },
        { body: '#1E0E35', light: '#2E1850', lip: '#14082A', window: '#00F0FF', windowLit: '#B026FF', ledge: '#2E1850' },
        { body: '#120A22', light: '#221438', lip: '#0A0618', window: '#B026FF', windowLit: '#FF2D95', ledge: '#221438' },
        { body: '#180C2A', light: '#281642', lip: '#100820', window: '#00F0FF', windowLit: '#FFE000', ledge: '#281642' },
        { body: '#1C0E30', light: '#2C1848', lip: '#120A25', window: '#FF2D95', windowLit: '#00F0FF', ledge: '#2C1848' },
      ],
      outline: '#00F0FF',
    },
    blockColorPairs: [
      ['#1A0A2E', '#120822'],
      ['#150828', '#0D0518'],
      ['#1E0E35', '#14082A'],
      ['#120A22', '#0A0618'],
      ['#180C2A', '#100820'],
      ['#1C0E30', '#120A25'],
    ],
    preview: {
      skyTop: '#0A0A1A',
      skyBottom: '#1A1540',
      groundColor: '#1A0A2E',
      accentColor: '#00F0FF',
    },
  },
];

export function getMapTheme(id: string): MapTheme {
  return MAP_THEMES.find(m => m.id === id) ?? MAP_THEMES[0];
}
