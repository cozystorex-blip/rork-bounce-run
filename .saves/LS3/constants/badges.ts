export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'gaps' | 'runs' | 'score';
  icon: string;
  color: string;
}

export const BADGES: Badge[] = [
  {
    id: 'first_gap',
    name: 'First Gap!',
    description: 'Pass through your first gap',
    requirement: 1,
    type: 'gaps',
    icon: '⭐',
    color: '#FFD84A',
  },
  {
    id: 'ten_passed',
    name: '10 Passed',
    description: 'Pass through 10 gaps in one run',
    requirement: 10,
    type: 'gaps',
    icon: '🌟',
    color: '#FFA94D',
  },
  {
    id: 'twenty_five',
    name: '25 Passed',
    description: 'Pass through 25 gaps in one run',
    requirement: 25,
    type: 'gaps',
    icon: '💫',
    color: '#FF6B6B',
  },
  {
    id: 'fifty_passed',
    name: '50 Passed',
    description: 'Pass through 50 gaps in one run',
    requirement: 50,
    type: 'gaps',
    icon: '🏆',
    color: '#5B9BD5',
  },
  {
    id: 'hundred_passed',
    name: '100 Passed',
    description: 'Pass through 100 gaps in one run',
    requirement: 100,
    type: 'gaps',
    icon: '👑',
    color: '#B57EDC',
  },
  {
    id: 'long_run',
    name: 'Long Run',
    description: 'Travel 500m in a single run',
    requirement: 500,
    type: 'score',
    icon: '🎯',
    color: '#7EC850',
  },
  {
    id: 'tap_master',
    name: 'Tap Master',
    description: 'Complete 20 total runs',
    requirement: 20,
    type: 'runs',
    icon: '🎮',
    color: '#FF6B6B',
  },
];
