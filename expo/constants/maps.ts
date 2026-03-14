export interface MapDefinition {
  id: string;
  name: string;
  emoji: string;
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundTop: string;
  groundAccent: string;
  obstacleOutline: string;
  cloudColor: string;
  starColor?: string;
}

export const MAPS: MapDefinition[] = [
  {
    id: 'default',
    name: 'Sunny Day',
    emoji: '☀️',
    skyTop: '#4BA3D4',
    skyBottom: '#87CEEB',
    ground: '#8B6914',
    groundTop: '#5D8A2D',
    groundAccent: '#4A7023',
    obstacleOutline: 'rgba(0,0,0,0.15)',
    cloudColor: 'rgba(255,255,255,0.7)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    skyTop: '#FF6B35',
    skyBottom: '#FFB347',
    ground: '#5C3D1E',
    groundTop: '#7A5C3D',
    groundAccent: '#6B4E31',
    obstacleOutline: 'rgba(80,30,0,0.2)',
    cloudColor: 'rgba(255,200,150,0.5)',
  },
  {
    id: 'night',
    name: 'Midnight',
    emoji: '🌙',
    skyTop: '#0F0C29',
    skyBottom: '#302B63',
    ground: '#1A1A2E',
    groundTop: '#16213E',
    groundAccent: '#0F3460',
    obstacleOutline: 'rgba(100,100,255,0.2)',
    cloudColor: 'rgba(100,100,180,0.3)',
    starColor: '#FFFFFF',
  },
  {
    id: 'neon',
    name: 'Neon City',
    emoji: '🌃',
    skyTop: '#0A0A1A',
    skyBottom: '#1A0A2E',
    ground: '#0A0A12',
    groundTop: '#00F0FF',
    groundAccent: '#FF2D95',
    obstacleOutline: 'rgba(0,240,255,0.3)',
    cloudColor: 'rgba(255,45,149,0.15)',
    starColor: '#00F0FF',
  },
];

export function getMapById(id: string): MapDefinition {
  return MAPS.find(m => m.id === id) ?? MAPS[0];
}
