import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play, Home, RotateCcw, Trophy, Star, Ruler, Volume2, VolumeX, CupSoda, Coins } from 'lucide-react-native';
import { BoostIcon, DiveIcon, BarrelIcon, SpinIcon, SuperFlapIcon } from '@/components/TrickIcons';
import { GameColors } from '@/constants/colors';
import { GAME_CONFIG, BLOCK_COLOR_PAIRS, LEVELS, LevelConfig, OBSTACLE_TUNING } from '@/constants/game';
import { BADGES } from '@/constants/badges';
import { useGameState, useFormattedDistance } from '@/providers/GameStateProvider';
import BlobSkin from '@/components/BlobSkin';
import { DEFAULT_MOVEMENT } from '@/constants/skins';
import { Share, Platform } from 'react-native';
import { SCREEN, scale, verticalScale, moderateScale, GROUND_HEIGHT, MODAL } from '@/constants/layout';
import { audioManager } from '@/utils/audio';
import { getMapTheme } from '@/constants/maps';
import { gameStyles as styles, trickIconStyles } from '@/constants/gameStyles';

const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

interface Obstacle {
  id: number;
  x: number;
  gapY: number;
  gapSize: number;
  color1: string;
  color2: string;
  passed: boolean;
  angle: number;
}

interface CloudData {
  id: number;
  x: number;
  y: number;
  scale: number;
  speed: number;
}



interface FloatingScore {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
  opacityAnim: Animated.Value;
}

type GameStatus = 'ready' | 'playing' | 'paused' | 'over';

type TrickType = 'boost' | 'dive' | 'barrel_left' | 'barrel_right' | 'super_flap';

interface TrickInfo {
  name: string;
  color: string;
  emoji: string;
  cooldown: number;
}

const TRICKS: Record<TrickType, TrickInfo> = {
  boost: { name: 'BOOST', color: '#00F0FF', emoji: 'rocket', cooldown: 800 },
  dive: { name: 'DIVE', color: '#FF2D95', emoji: 'zap', cooldown: 600 },
  barrel_left: { name: 'BARREL', color: '#B026FF', emoji: 'refresh', cooldown: 1000 },
  barrel_right: { name: 'SPIN', color: '#FFE000', emoji: 'sparkles', cooldown: 1000 },
  super_flap: { name: 'FLAP', color: '#7CFF6B', emoji: 'bird', cooldown: 400 },
};

const TrickIcon = React.memo(function TrickIcon({ type, size, color }: { type: string; size: number; color: string }) {
  const iconSize = size * 1.6;
  const wrapStyle = [trickIconStyles.iconWrap, { backgroundColor: color + '25', borderColor: color + '60' }];
  switch (type) {
    case 'rocket':
      return <View style={wrapStyle}><BoostIcon size={iconSize} color={color} /></View>;
    case 'zap':
      return <View style={wrapStyle}><DiveIcon size={iconSize} color={color} /></View>;
    case 'refresh':
      return <View style={wrapStyle}><BarrelIcon size={iconSize} color={color} /></View>;
    case 'sparkles':
      return <View style={wrapStyle}><SpinIcon size={iconSize} color={color} /></View>;
    case 'bird':
      return <View style={wrapStyle}><SuperFlapIcon size={iconSize} color={color} /></View>;
    default:
      return null;
  }
});

const NEON_ZONE_TOP = 0.25;
const NEON_ZONE_BOTTOM = 0.75;
const NEON_ZONE_LEFT = 0.33;
const NEON_ZONE_RIGHT = 0.67;
const NEON_CEILING_BUFFER = 80;
const NEON_FLOOR_BUFFER = 100;

function getLevelForScore(score: number): LevelConfig {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (score >= lvl.scoreThreshold) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

const CHARACTER_BASE_X = SCREEN_WIDTH * GAME_CONFIG.CHARACTER_X_POSITION;
const FLAPPY_BASE_X = SCREEN_WIDTH * 0.3;
const POLE_CAP_W = scale(56);
const POLE_CAP_H = scale(16);
const POLE_SHAFT_W = scale(22);
const POLE_BASE_W = scale(28);
const POLE_BASE_H = scale(9);
const POLE_BORDER = scale(3.5);
const POLE_CAP_RADIUS = scale(7);
const POLE_SHAFT_RADIUS = scale(5);
const MAX_X_DRIFT = scale(42);
const DRIFT_LERP = 0.28;
const DRIFT_RETURN = 0.14;

function generateCloud(id: number, startX?: number): CloudData {
  return {
    id,
    x: startX ?? SCREEN_WIDTH + Math.random() * 200,
    y: 30 + Math.random() * (SCREEN_HEIGHT * 0.4),
    scale: 0.4 + Math.random() * 0.6,
    speed: 0.5 + Math.random() * 0.8,
  };
}

const GameBlobSkin = React.memo(function GameBlobSkin({ skinData }: { skinData: { id: string; name: string; personality: string; bodyColor: string; bodyDark: string; eyeStyle: string; mouthStyle: string; hatColor: string; hatBand: string; hatStyle: string; accentColor: string; cheekColor: string; locked: boolean; unlockRequirement: number; labelColor: string; labelBg: string; speechLine: string } }) {
  return <BlobSkin skin={skinData as any} size={GAME_CONFIG.CHARACTER_SIZE} animated={false} />;
});

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, submitRun, currentSkin, toggleMusic } = useGameState();
  const mapTheme = getMapTheme(stats.selectedMap);

  const safeTop = Math.max(insets.top, 20);
  const safeBottom = Math.max(insets.bottom, 10);

  const [gameStatus, setGameStatusState] = useState<GameStatus>('ready');
  const setGameStatus = useCallback((status: GameStatus) => {
    gameStatusRef.current = status;
    setGameStatusState(status);
  }, []);
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const characterY = useRef(SCREEN_HEIGHT / 2);
  const velocity = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const clouds = useRef<CloudData[]>(
    Array.from({ length: 2 }, (_, i) => generateCloud(i, Math.random() * SCREEN_WIDTH))
  );
  const cloudTickCounter = useRef(0);

  const speedMultiplier = useRef(1);
  const tapSpeedBonus = useRef(0);
  const frameCount = useRef(0);
  const obstacleIdCounter = useRef(0);
  const lastObstacleSpawn = useRef(0);
  const phasePassed = useRef(0);
  const isFastPhase = useRef(true);
  const phaseBlend = useRef(1.0);
  const phaseTransitionCounter = useRef(0);

  const charAnim = useRef(new Animated.Value(SCREEN_HEIGHT / 2)).current;
  const charXAnim = useRef(new Animated.Value(0)).current;
  const charRotation = useRef(new Animated.Value(0)).current;
  const charScale = useRef(new Animated.Value(1)).current;
  const charStretchX = useRef(new Animated.Value(1)).current;
  const charStretchY = useRef(new Animated.Value(1)).current;
  const charWobble = useRef(new Animated.Value(0)).current;

  const trajectoryOpacity = useRef(new Animated.Value(0)).current;
  const trajectoryFade = useRef<Animated.CompositeAnimation | null>(null);

  const prevRotVal = useRef(0);
  const prevStretchX = useRef(1);
  const prevStretchY = useRef(1);
  const prevVelSign = useRef(0);

  const xDrift = useRef(0);
  const targetXDrift = useRef(0);
  const characterX = useRef(CHARACTER_BASE_X);
  const tapSideForce = useRef(0);

  const scorePopScale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;
  const gameOverScale = useRef(new Animated.Value(0.8)).current;
  const readyPulse = useRef(new Animated.Value(1)).current;
  const skyShift = useRef(new Animated.Value(0)).current;

  const splatAnims = useRef(
    Array.from({ length: 5 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const [showSplat, setShowSplat] = useState<boolean>(false);
  const splatPosition = useRef({ x: CHARACTER_BASE_X, y: SCREEN_HEIGHT / 2 });

  const renderTickRef = useRef(0);
  const [renderTick, setRenderTick] = useState<number>(0);
  const batchedScoreRef = useRef(0);
  const needsScoreUpdate = useRef(false);
  const [musicOn, setMusicOn] = useState<boolean>(stats.musicEnabled);
  const shareScaleAnim = useRef(new Animated.Value(1)).current;

  const [activeTrick, setActiveTrickState] = useState<{ type: TrickType; info: TrickInfo } | null>(null);
  const activeTrickRef = useRef<{ type: TrickType; info: TrickInfo } | null>(null);
  const setActiveTrick = useCallback((v: { type: TrickType; info: TrickInfo } | null) => {
    activeTrickRef.current = v;
    setActiveTrickState(v);
  }, []);
  const trickLabelAnim = useRef(new Animated.Value(0)).current;
  const trickLabelScale = useRef(new Animated.Value(0.3)).current;
  const trickSpinAnim = useRef(new Animated.Value(0)).current;
  const lastTrickTime = useRef<number>(0);
  const trickCombo = useRef<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const comboAnim = useRef(new Animated.Value(0)).current;
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const levelRef = useRef<LevelConfig>(LEVELS[0]);
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(0.5)).current;
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const renderThrottleRef = useRef(0);
  const floatingScoreIdRef = useRef(0);
  const scoreChangedRef = useRef(false);
  const stepPhysicsRef = useRef<() => boolean>(() => true);
  const handleTapRef = useRef<(evt?: GestureResponderEvent) => void>(() => {});
  const gameStatusRef = useRef<GameStatus>('ready');

  useEffect(() => {
    const pulseX = Animated.loop(
      Animated.sequence([
        Animated.timing(charStretchX, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(charStretchX, { toValue: 0.96, duration: 1000, useNativeDriver: true }),
      ])
    );
    const pulseY = Animated.loop(
      Animated.sequence([
        Animated.timing(charStretchY, { toValue: 0.95, duration: 1000, useNativeDriver: true }),
        Animated.timing(charStretchY, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseX.start();
    pulseY.start();

    const skyLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(skyShift, { toValue: 1, duration: 20000, useNativeDriver: true }),
        Animated.timing(skyShift, { toValue: 0, duration: 20000, useNativeDriver: true }),
      ])
    );
    skyLoop.start();

    return () => { pulseX.stop(); pulseY.stop(); skyLoop.stop(); };
  }, [charStretchX, charStretchY, skyShift]);

  const lastGapY = useRef(SCREEN_HEIGHT / 2);
  const prevCharY = useRef(SCREEN_HEIGHT / 2);
  const prevCharBottom = useRef(SCREEN_HEIGHT / 2);
  const currentObstacleSpeed = useRef(GAME_CONFIG.OBSTACLE_SPEED);

  const isNeonMap = mapTheme.id === 'neon';
  const baseX = isNeonMap ? FLAPPY_BASE_X : CHARACTER_BASE_X;

  const getCharX = useCallback(() => isNeonMap ? FLAPPY_BASE_X : CHARACTER_BASE_X + xDrift.current, [isNeonMap]);

  const detectTrickZone = useCallback((tapX: number, tapY: number): TrickType => {
    const normX = tapX / SCREEN_WIDTH;
    const normY = tapY / SCREEN_HEIGHT;

    if (normY < NEON_ZONE_TOP) return 'boost';
    if (normY > NEON_ZONE_BOTTOM) return 'dive';
    if (normX < NEON_ZONE_LEFT) return 'barrel_left';
    if (normX > NEON_ZONE_RIGHT) return 'barrel_right';
    return 'super_flap';
  }, []);

  const showTrickLabel = useCallback((trick: TrickType) => {
    const info = TRICKS[trick];
    setActiveTrick({ type: trick, info });
    trickLabelAnim.setValue(0);
    trickLabelScale.setValue(0.3);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(trickLabelAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(trickLabelAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
      Animated.spring(trickLabelScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start(() => setActiveTrick(null));
  }, [trickLabelAnim, trickLabelScale, setActiveTrick]);

  const triggerTrickSpin = useCallback((trick: TrickType) => {
    let toVal = 0;
    let duration = 400;
    if (trick === 'barrel_left') { toVal = -1; duration = 450; }
    else if (trick === 'barrel_right') { toVal = 1; duration = 450; }
    else if (trick === 'boost') { toVal = -0.5; duration = 300; }
    else if (trick === 'dive') { toVal = 0.5; duration = 300; }
    else { toVal = 0.3; duration = 250; }

    trickSpinAnim.setValue(0);
    Animated.sequence([
      Animated.timing(trickSpinAnim, { toValue: toVal, duration: duration * 0.4, useNativeDriver: true }),
      Animated.timing(trickSpinAnim, { toValue: 0, duration: duration * 0.6, useNativeDriver: true }),
    ]).start();
  }, [trickSpinAnim]);

  const updateCombo = useCallback(() => {
    trickCombo.current++;
    setComboCount(trickCombo.current);
    comboAnim.setValue(0);
    Animated.sequence([
      Animated.timing(comboAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(comboAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => {
      trickCombo.current = 0;
      setComboCount(0);
    }, 2000);
  }, [comboAnim]);

  const spawnObstacle = useCallback(() => {
    const lvl = levelRef.current;
    const gapSize = lvl.fastGap;
    const ceilingY = safeTop;
    const floorY = SCREEN_HEIGHT - GROUND_HEIGHT;
    const gapCenterMin = ceilingY + OBSTACLE_TUNING.GAP_CENTER_MIN_PADDING + gapSize / 2;
    const gapCenterMax = floorY - OBSTACLE_TUNING.GAP_CENTER_MAX_PADDING - gapSize / 2;
    const safeMin = Math.min(gapCenterMin, gapCenterMax);
    const safeMax = Math.max(gapCenterMin, gapCenterMax);
    const shiftFactor = 0.40 + (lvl.level - 1) * 0.05;
    const maxShift = (safeMax - safeMin) * Math.min(shiftFactor, 0.7);
    const rawTarget = lastGapY.current + (Math.random() - 0.5) * maxShift * 2;
    const midY = (safeMin + safeMax) / 2;
    const pullToCenter = 0.15;
    const targetY = rawTarget + (midY - rawTarget) * pullToCenter;
    const gapCenter = Math.max(safeMin, Math.min(safeMax, targetY));
    lastGapY.current = gapCenter;
    const pair = BLOCK_COLOR_PAIRS[obstacleIdCounter.current % BLOCK_COLOR_PAIRS.length];
    const pipeAngle = 0;
    obstacles.current.push({
      id: obstacleIdCounter.current++,
      x: SCREEN_WIDTH + 50,
      gapY: gapCenter,
      gapSize,
      color1: pair[0],
      color2: pair[1],
      passed: false,
      angle: pipeAngle,
    });
  }, [safeTop]);

  const checkCollision = useCallback((cy: number, obs: Obstacle[]): boolean => {
    const hitSizeX = GAME_CONFIG.CHARACTER_SIZE * GAME_CONFIG.HITBOX_SHRINK;
    const hitSizeY = GAME_CONFIG.CHARACTER_SIZE * 0.97;
    const cx = getCharX();
    const halfHitX = hitSizeX / 2;
    const halfHitY = hitSizeY / 2;
    const centerY = cy + GAME_CONFIG.CHARACTER_SIZE / 2;
    const charLeft = cx - halfHitX;
    const charRight = cx + halfHitX;
    const charTop = centerY - halfHitY;
    const charBottom = centerY + halfHitY;

    const ceilingY = safeTop;
    const floorY = SCREEN_HEIGHT - GROUND_HEIGHT;
    if (charTop <= ceilingY || charBottom >= floorY) {
      return true;
    }

    const capHalfW = POLE_CAP_W / 2;
    const speedBuf = Math.ceil(currentObstacleSpeed.current) + 2;
    const prevBot = prevCharBottom.current;

    for (let oi = 0; oi < obs.length; oi++) {
      const o = obs[oi];
      const gap = o.gapSize ?? GAME_CONFIG.OBSTACLE_GAP;
      const gapStart = o.gapY - gap / 2;
      const gapEnd = o.gapY + gap / 2;

      const pipeLeft = o.x - capHalfW - speedBuf;
      const pipeRight = o.x + capHalfW;

      if (charRight > pipeLeft && charLeft < pipeRight) {
        if (charTop < gapStart) return true;
        if (charBottom > gapEnd) return true;

        if (prevBot <= gapEnd && charBottom > gapEnd) return true;

        if (charBottom > gapEnd - 2 && charTop < gapEnd + POLE_CAP_H) return true;
      }

      const shaftHalfW = POLE_SHAFT_W / 2;
      const shaftLeft = o.x - shaftHalfW - speedBuf;
      const shaftRight = o.x + shaftHalfW;

      if (charRight > shaftLeft && charLeft < shaftRight) {
        if (charTop < gapStart - POLE_CAP_H) return true;
        if (charBottom > gapEnd + POLE_CAP_H) return true;
      }

      const baseHalfW = POLE_BASE_W / 2;
      const baseLeft = o.x - baseHalfW - speedBuf;
      const baseRight = o.x + baseHalfW;
      if (charRight > baseLeft && charLeft < baseRight) {
        const botShaftTop = gapEnd + POLE_CAP_H;
        const botShaftH = Math.max(0, floorY - botShaftTop - POLE_BASE_H);
        const botBaseTop = botShaftTop + botShaftH;
        if (charBottom > botBaseTop) return true;
      }
    }
    return false;
  }, [safeTop, getCharX]);

  const triggerSplat = useCallback(() => {
    splatPosition.current = { x: getCharX(), y: characterY.current };
    setShowSplat(true);
    const anims = splatAnims.map((s, i) => {
      const angle = (i / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const dist = 25 + Math.random() * 40;
      s.x.setValue(0);
      s.y.setValue(0);
      s.scale.setValue(0.6 + Math.random() * 0.6);
      s.opacity.setValue(1);
      return Animated.parallel([
        Animated.timing(s.x, { toValue: Math.cos(angle) * dist, duration: 400, useNativeDriver: true }),
        Animated.timing(s.y, { toValue: Math.sin(angle) * dist, duration: 400, useNativeDriver: true }),
        Animated.timing(s.opacity, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(s.scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
          Animated.timing(s.scale, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
      ]);
    });
    Animated.parallel(anims).start(() => setShowSplat(false));
  }, [splatAnims, getCharX]);

  const floatingScorePool = useRef<FloatingScore[]>([]);
  const activeFloatingCount = useRef(0);

  const spawnFloatingScore = useCallback((x: number, y: number, _val: number) => {
    if (activeFloatingCount.current >= 1) return;
    activeFloatingCount.current++;
    const id = floatingScoreIdRef.current++;
    let fs: FloatingScore;
    if (floatingScorePool.current.length > 0) {
      fs = floatingScorePool.current.pop()!;
      fs.id = id;
      fs.x = x;
      fs.y = y;
      fs.anim.setValue(0);
      fs.opacityAnim.setValue(1);
    } else {
      fs = { id, x, y, anim: new Animated.Value(0), opacityAnim: new Animated.Value(1) };
    }
    setFloatingScores([fs]);
    Animated.parallel([
      Animated.timing(fs.anim, { toValue: -50, duration: 350, useNativeDriver: true }),
      Animated.timing(fs.opacityAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      activeFloatingCount.current--;
      setFloatingScores([]);
      floatingScorePool.current.push(fs);
    });
  }, []);

  const triggerGameOver = useCallback(() => {
    setGameStatus('over');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    triggerSplat();

    Animated.parallel([
      Animated.sequence([
        Animated.timing(shakeX, { toValue: 7, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -7, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 5, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(shakeY, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: 2, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]),
    ]).start();

    const finalScore = scoreRef.current;
    const finalDistance = distanceRef.current;
    setScore(finalScore);
    setDistance(finalDistance);

    setTimeout(() => {
      const result = submitRun(finalScore, finalDistance);
      setNewBadges(result.newBadges);
      setCoinsEarned(result.coinsEarned);

      Animated.parallel([
        Animated.timing(gameOverOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(gameOverScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]).start();
    }, 350);
  }, [submitRun, shakeX, shakeY, gameOverOpacity, gameOverScale, triggerSplat, setGameStatus]);

  const movementProfile = currentSkin?.movement ?? DEFAULT_MOVEMENT;
  const movementProfileRef = useRef(movementProfile);
  movementProfileRef.current = movementProfile;

  const stepPhysics = useCallback(() => {
    phaseBlend.current = 1.0;

    const lvl = levelRef.current;
    const mp = movementProfileRef.current;
    const gravBase = lvl.fastGravity * mp.gravityMultiplier;
    const velSign = velocity.current < 0 ? -1 : 1;
    const velMag = Math.abs(velocity.current);
    const gravCurve = velocity.current < 0
      ? gravBase * (0.88 + 0.12 * Math.min(1, velMag / 5))
      : gravBase * (1.0 + 0.04 * Math.min(1, velMag / 4));
    velocity.current += gravCurve;
    velocity.current *= mp.fallDamping;
    if (velocity.current > GAME_CONFIG.MAX_FALL_VELOCITY) {
      velocity.current = GAME_CONFIG.MAX_FALL_VELOCITY;
    }

    if (velocity.current < 0) {
      const riseEase = 1.0 - Math.min(0.32, Math.abs(velocity.current) * 0.014);
      const riseSpeed = velocity.current * riseEase * (1.0 + (1.0 - mp.riseSmoothing) * 0.18);
      characterY.current += riseSpeed;
    } else {
      const fallEase = 1.0 - Math.max(0, (velocity.current - 2.5) * 0.022);
      characterY.current += velocity.current * Math.max(0.87, fallEase);
    }

    const minY = safeTop + 2;
    const maxY = SCREEN_HEIGHT - GROUND_HEIGHT - 2;
    if (characterY.current < minY) {
      characterY.current = minY;
      velocity.current = Math.max(velocity.current, 0.5);
    } else if (characterY.current > maxY) {
      characterY.current = maxY;
      velocity.current = Math.min(velocity.current, -0.5);
    }

    const vel = velocity.current;
    if (isNeonMap) {
      if (Math.abs(xDrift.current) > 0.5) {
        xDrift.current *= 0.88;
        characterX.current = FLAPPY_BASE_X + xDrift.current;
        charXAnim.setValue(xDrift.current);
      } else if (xDrift.current !== 0) {
        xDrift.current = 0;
        characterX.current = FLAPPY_BASE_X;
        charXAnim.setValue(0);
      }
      targetXDrift.current = 0;
      tapSideForce.current = 0;
    } else {
      if (vel < -1.5) {
        targetXDrift.current = MAX_X_DRIFT * 0.3;
      } else if (vel > 2.5) {
        targetXDrift.current = -MAX_X_DRIFT * 0.2;
      } else {
        targetXDrift.current = 0;
      }
      targetXDrift.current += tapSideForce.current;
      tapSideForce.current *= 0.92;

      const driftDelta = targetXDrift.current - xDrift.current;
      const lerpFactor = Math.abs(driftDelta) > 1 ? DRIFT_LERP : DRIFT_RETURN;
      xDrift.current += driftDelta * lerpFactor;
      xDrift.current = Math.max(-MAX_X_DRIFT, Math.min(MAX_X_DRIFT * 1.2, xDrift.current));
      characterX.current = CHARACTER_BASE_X + xDrift.current;
      charXAnim.setValue(xDrift.current);
    }

    const absVel = Math.abs(vel);
    let stretchYVal: number;
    let stretchXVal: number;

    if (vel < -0.5) {
      stretchYVal = Math.min(1.32, 1 + absVel * 0.028);
      stretchXVal = Math.max(0.76, 1 - absVel * 0.018);
    } else if (vel > 0.8) {
      const fallT = Math.min(1, absVel / 5);
      stretchYVal = Math.max(0.88, 1 - fallT * 0.12);
      stretchXVal = Math.min(1.14, 1 + fallT * 0.14);
    } else {
      const returnSpeed = 0.15;
      stretchYVal = prevStretchY.current + (1 - prevStretchY.current) * returnSpeed;
      stretchXVal = prevStretchX.current + (1 - prevStretchX.current) * returnSpeed;
    }

    if (prevVelSign.current < 0 && vel > 0.3) {
      const elasticBounce = Math.min(0.06, absVel * 0.012);
      stretchXVal += elasticBounce;
      stretchYVal -= elasticBounce * 0.8;
    } else if (prevVelSign.current > 0 && vel < -0.3) {
      const elasticBounce = Math.min(0.05, absVel * 0.01);
      stretchYVal += elasticBounce;
      stretchXVal -= elasticBounce * 0.8;
    }
    prevVelSign.current = vel;

    if (Math.abs(stretchYVal - prevStretchY.current) > 0.008) {
      charStretchY.setValue(stretchYVal);
      prevStretchY.current = stretchYVal;
    }
    if (Math.abs(stretchXVal - prevStretchX.current) > 0.008) {
      charStretchX.setValue(stretchXVal);
      prevStretchX.current = stretchXVal;
    }

    tapSpeedBonus.current *= GAME_CONFIG.TAP_SPEED_DECAY;
    if (tapSpeedBonus.current < 0.001) tapSpeedBonus.current = 0;
    const clampedTapBonus = Math.min(tapSpeedBonus.current, GAME_CONFIG.MAX_TAP_SPEED_BONUS);
    const currentSpeed = GAME_CONFIG.OBSTACLE_SPEED * (speedMultiplier.current + clampedTapBonus) * lvl.fastSpeedMult;
    currentObstacleSpeed.current = currentSpeed;
    const cx = getCharX();

    const obs = obstacles.current;
    const obsLen = obs.length;
    let i = 0;
    for (let j = 0; j < obsLen; j++) {
      obs[j].x -= currentSpeed;
      if (obs[j].x > -100) {
        obs[i] = obs[j];
        i++;
      }
    }
    obs.length = i;

    let scored = false;
    let newlyPassed = 0;
    for (let si = 0; si < obs.length; si++) {
      const o = obs[si];
      if (!o.passed && o.x < cx - POLE_CAP_W / 2) {
        o.passed = true;
        scoreRef.current++;
        scored = true;
        newlyPassed++;
        spawnFloatingScore(o.x, o.gapY, scoreRef.current);
      }
    }

    if (scored) {
      const newLevel = getLevelForScore(scoreRef.current);
      if (newLevel.level !== lvl.level) {
        levelRef.current = newLevel;
        setCurrentLevel(newLevel);
        phasePassed.current = 0;
        phaseTransitionCounter.current = 0;
        setShowLevelUp(true);
        levelUpAnim.setValue(0);
        levelUpScale.setValue(0.5);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(levelUpAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(1200),
            Animated.timing(levelUpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
          Animated.spring(levelUpScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        ]).start(() => setShowLevelUp(false));
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      phasePassed.current += newlyPassed;
      scoreChangedRef.current = true;
      void audioManager.playScore();
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.sequence([
        Animated.timing(scorePopScale, { toValue: 1.3, duration: 60, useNativeDriver: true }),
        Animated.spring(scorePopScale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }),
      ]).start();
    }

    cloudTickCounter.current++;
    if (cloudTickCounter.current >= 45) {
      cloudTickCounter.current = 0;
      for (let ci = 0; ci < clouds.current.length; ci++) {
        const c = clouds.current[ci];
        c.x -= c.speed * (currentSpeed / GAME_CONFIG.OBSTACLE_SPEED) * 18;
        if (c.x < -150) {
          const fresh = generateCloud(c.id);
          c.x = fresh.x;
          c.y = fresh.y;
          c.scale = fresh.scale;
          c.speed = fresh.speed;
        }
      }
    }

    frameCount.current++;
    lastObstacleSpawn.current += GAME_CONFIG.FRAME_RATE;
    const spawnSpeedFactor = Math.min(speedMultiplier.current, 1.4);
    const spawnInterval = lvl.spawnInterval / spawnSpeedFactor;
    if (lastObstacleSpawn.current >= spawnInterval) {
      spawnObstacle();
      lastObstacleSpawn.current = 0;
    }

    const distBasedProgress = distanceRef.current * 0.00012;
    speedMultiplier.current = Math.min(
      GAME_CONFIG.MAX_SPEED_MULTIPLIER,
      1 + distBasedProgress
    );

    distanceRef.current += currentSpeed * 0.1;

    prevCharBottom.current = characterY.current + GAME_CONFIG.CHARACTER_SIZE / 2 + (GAME_CONFIG.CHARACTER_SIZE * 0.97) / 2;

    if (checkCollision(characterY.current, obs)) {
      setDistance(distanceRef.current);
      triggerGameOver();
      return false;
    }

    prevCharY.current = characterY.current;

    charAnim.setValue(characterY.current);
    const rotVal = Math.max(-1, Math.min(1, velocity.current / 8));
    if (Math.abs(rotVal - prevRotVal.current) > 0.03) {
      charRotation.setValue(rotVal);
      prevRotVal.current = rotVal;
    }

    renderThrottleRef.current++;
    if (renderThrottleRef.current >= 3) {
      renderThrottleRef.current = 0;
      renderTickRef.current++;
      if (scoreChangedRef.current) {
        scoreChangedRef.current = false;
        batchedScoreRef.current = scoreRef.current;
        needsScoreUpdate.current = true;
      }
      if (needsScoreUpdate.current) {
        needsScoreUpdate.current = false;
        setScore(batchedScoreRef.current);
      }
      setRenderTick(renderTickRef.current);
    }

    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnObstacle, checkCollision, triggerGameOver, charAnim, charXAnim, charRotation, scorePopScale, charStretchX, charStretchY, levelUpAnim, levelUpScale, spawnFloatingScore, getCharX, isNeonMap]);

  stepPhysicsRef.current = stepPhysics;

  useEffect(() => {
    if (gameStatus === 'playing') {
      void audioManager.startMusic();
    } else if (gameStatus === 'over') {
      void audioManager.stopMusic();
    }
  }, [gameStatus]);

  useEffect(() => {
    return () => {
      void audioManager.stopMusic();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (comboTimer.current) {
        clearTimeout(comboTimer.current);
        comboTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastTimeRef.current = 0;
    accumulatorRef.current = 0;

    const tick = (timestamp: number) => {
      if (gameStatusRef.current !== 'playing') return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rawDelta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (rawDelta > 200) {
        accumulatorRef.current = GAME_CONFIG.FRAME_RATE;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min(rawDelta, 34);
      accumulatorRef.current += delta;

      let steps = 0;
      const maxSteps = 4;
      while (accumulatorRef.current >= GAME_CONFIG.FRAME_RATE && steps < maxSteps) {
        const alive = stepPhysicsRef.current();
        if (!alive) return;
        accumulatorRef.current -= GAME_CONFIG.FRAME_RATE;
        steps++;
      }

      if (accumulatorRef.current > GAME_CONFIG.FRAME_RATE * maxSteps) {
        accumulatorRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  const handleTap = useCallback((evt?: GestureResponderEvent) => {
    if (gameStatusRef.current === 'over') return;

    let tapX = SCREEN_WIDTH / 2;
    let tapY = SCREEN_HEIGHT / 2;
    if (evt?.nativeEvent) {
      tapX = evt.nativeEvent.locationX ?? tapX;
      tapY = evt.nativeEvent.locationY ?? tapY;
    }

    const normalizedX = (tapX / SCREEN_WIDTH - 0.5) * 2;
    const sideForce = isNeonMap ? 0 : normalizedX * MAX_X_DRIFT * 0.95;

    const normalizedY = tapY / SCREEN_HEIGHT;
    const jumpMod = isNeonMap ? 1 : 1 + (0.5 - normalizedY) * 0.3;

    if (gameStatusRef.current === 'ready') {
      setGameStatus('playing');
      tapSideForce.current = sideForce;
      tapSpeedBonus.current = Math.min(GAME_CONFIG.MAX_TAP_SPEED_BONUS, tapSpeedBonus.current + GAME_CONFIG.TAP_SPEED_BOOST);
      const mp = movementProfileRef.current;
      velocity.current = levelRef.current.fastJump * jumpMod * mp.flapForceMultiplier * 1.05;
      charAnim.setValue(characterY.current);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      charStretchX.stopAnimation();
      charStretchY.stopAnimation();
      Animated.parallel([
        Animated.sequence([
          Animated.timing(charStretchX, { toValue: 0.78, duration: 50, useNativeDriver: true }),
          Animated.spring(charStretchX, { toValue: 1.08, friction: 3, tension: 220, useNativeDriver: true }),
          Animated.spring(charStretchX, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(charStretchY, { toValue: 1.22, duration: 50, useNativeDriver: true }),
          Animated.spring(charStretchY, { toValue: 0.92, friction: 3, tension: 220, useNativeDriver: true }),
          Animated.spring(charStretchY, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        ]),
      ]).start();
      if (trajectoryFade.current) trajectoryFade.current.stop();
      trajectoryOpacity.setValue(0.7);
      trajectoryFade.current = Animated.timing(trajectoryOpacity, { toValue: 0, duration: 400, useNativeDriver: true });
      trajectoryFade.current.start();
      if (mp.wobbleAmount > 0) {
        charWobble.setValue(0);
        Animated.sequence([
          Animated.timing(charWobble, { toValue: 1, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
          Animated.timing(charWobble, { toValue: -0.6, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
          Animated.timing(charWobble, { toValue: 0, duration: mp.wobbleDuration * 0.3, useNativeDriver: true }),
        ]).start();
      }
      return;
    }

    if (gameStatusRef.current === 'paused') return;

    const lvl = levelRef.current;

    charAnim.setValue(characterY.current);

    if (isNeonMap) {
      const now = Date.now();
      const trick = detectTrickZone(tapX, tapY);
      const trickInfo = TRICKS[trick];
      const cy = characterY.current;

      const canTrick = (now - lastTrickTime.current) >= trickInfo.cooldown;

      if (canTrick) {
        lastTrickTime.current = now;
        tapSpeedBonus.current = Math.min(GAME_CONFIG.MAX_TAP_SPEED_BONUS, tapSpeedBonus.current + GAME_CONFIG.TAP_SPEED_BOOST);

        let jumpForce = lvl.fastJump;
        let xForce = 0;

        switch (trick) {
          case 'boost':
            if (cy <= safeTop + NEON_CEILING_BUFFER) {
              jumpForce = lvl.fastJump * 0.5;
            } else {
              jumpForce = lvl.fastJump * 1.45;
            }
            break;
          case 'dive':
            if (cy >= SCREEN_HEIGHT - GROUND_HEIGHT - NEON_FLOOR_BUFFER) {
              jumpForce = lvl.fastJump * 0.8;
            } else {
              jumpForce = Math.abs(lvl.fastJump) * 0.6;
            }
            break;
          case 'barrel_left':
            jumpForce = lvl.fastJump * 0.9;
            xForce = -scale(18);
            break;
          case 'barrel_right':
            jumpForce = lvl.fastJump * 0.9;
            xForce = scale(18);
            break;
          case 'super_flap':
            jumpForce = lvl.fastJump * 1.1;
            break;
        }

        velocity.current = jumpForce;

        if (xForce !== 0) {
          const newX = Math.max(
            FLAPPY_BASE_X - scale(40),
            Math.min(FLAPPY_BASE_X + scale(40), characterX.current + xForce)
          );
          characterX.current = newX;
          xDrift.current = newX - FLAPPY_BASE_X;
          charXAnim.setValue(xDrift.current);

          setTimeout(() => {
            xDrift.current *= 0.3;
            characterX.current = FLAPPY_BASE_X + xDrift.current;
            charXAnim.setValue(xDrift.current);
          }, 300);
        }

        showTrickLabel(trick);
        triggerTrickSpin(trick);
        updateCombo();

        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        charStretchX.stopAnimation();
        charStretchY.stopAnimation();
        const trickSquashX = trick === 'boost' ? 0.75 : trick === 'dive' ? 1.15 : 0.82;
        const trickSquashY = trick === 'boost' ? 1.25 : trick === 'dive' ? 0.85 : 1.18;
        Animated.parallel([
          Animated.sequence([
            Animated.timing(charStretchX, { toValue: trickSquashX, duration: 50, useNativeDriver: true }),
            Animated.spring(charStretchX, { toValue: 1, friction: 3.5, tension: 160, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(charStretchY, { toValue: trickSquashY, duration: 50, useNativeDriver: true }),
            Animated.spring(charStretchY, { toValue: 1, friction: 3.5, tension: 160, useNativeDriver: true }),
          ]),
        ]).start();
      } else {
        velocity.current = lvl.fastJump;
        tapSpeedBonus.current = Math.min(GAME_CONFIG.MAX_TAP_SPEED_BONUS, tapSpeedBonus.current + GAME_CONFIG.TAP_SPEED_BOOST * 0.5);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        charStretchX.stopAnimation();
        charStretchY.stopAnimation();
        Animated.parallel([
          Animated.sequence([
            Animated.timing(charStretchX, { toValue: 1.12, duration: 45, useNativeDriver: true }),
            Animated.spring(charStretchX, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(charStretchY, { toValue: 0.88, duration: 45, useNativeDriver: true }),
            Animated.spring(charStretchY, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
          ]),
        ]).start();
      }
    } else {
      const mp = movementProfileRef.current;
      tapSideForce.current = sideForce;
      tapSpeedBonus.current = Math.min(GAME_CONFIG.MAX_TAP_SPEED_BONUS, tapSpeedBonus.current + GAME_CONFIG.TAP_SPEED_BOOST);
      velocity.current = lvl.fastJump * jumpMod * mp.flapForceMultiplier * 1.05;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      charStretchX.stopAnimation();
      charStretchY.stopAnimation();
      Animated.parallel([
        Animated.sequence([
          Animated.timing(charStretchX, { toValue: 1 + (1 - mp.flapSquashX) * 1.1, duration: Math.max(40, mp.flapSquashDuration * 0.6), useNativeDriver: true }),
          Animated.spring(charStretchX, { toValue: 0.94, friction: mp.flapSpringFriction * 0.6, tension: mp.flapSpringTension * 1.3, useNativeDriver: true }),
          Animated.spring(charStretchX, { toValue: 1, friction: mp.flapSpringFriction, tension: mp.flapSpringTension * 0.8, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(charStretchY, { toValue: mp.flapSquashX * 0.95, duration: Math.max(40, mp.flapSquashDuration * 0.6), useNativeDriver: true }),
          Animated.spring(charStretchY, { toValue: 1.06, friction: mp.flapSpringFriction * 0.6, tension: mp.flapSpringTension * 1.3, useNativeDriver: true }),
          Animated.spring(charStretchY, { toValue: 1, friction: mp.flapSpringFriction, tension: mp.flapSpringTension * 0.8, useNativeDriver: true }),
        ]),
      ]).start();
      if (trajectoryFade.current) trajectoryFade.current.stop();
      trajectoryOpacity.setValue(0.65);
      trajectoryFade.current = Animated.timing(trajectoryOpacity, { toValue: 0, duration: 350, useNativeDriver: true });
      trajectoryFade.current.start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charScale, charAnim, charStretchY, charWobble, isNeonMap, detectTrickZone, showTrickLabel, triggerTrickSpin, updateCombo, safeTop, charXAnim, setGameStatus]);

  handleTapRef.current = handleTap;

  const handlePause = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (gameStatusRef.current === 'playing') {
      setGameStatus('paused');
      void audioManager.pauseMusic();
    } else if (gameStatusRef.current === 'paused') {
      setGameStatus('playing');
      void audioManager.resumeMusic();
    }
  }, [setGameStatus]);

  const handleMusicToggle = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const enabled = await toggleMusic();
    setMusicOn(enabled);
  }, [toggleMusic]);

  const handleShareGameOver = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(shareScaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(shareScaleAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
    const message = `I scored ${scoreRef.current} in BlobDash! Level ${currentLevel.level} - ${currentLevel.name}. Can you beat me? 🟡`;
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ text: message, title: 'BlobDash Score' });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          console.log('Score copied to clipboard');
        }
      } else {
        await Share.share({ message, title: 'BlobDash Score' });
      }
    } catch (e) {
      console.log('Share cancelled or failed', e);
    }
  }, [currentLevel, shareScaleAnim]);

  const handleRestart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    characterY.current = SCREEN_HEIGHT / 2;
    velocity.current = 0;
    xDrift.current = 0;
    targetXDrift.current = 0;
    tapSideForce.current = 0;
    characterX.current = isNeonMap ? FLAPPY_BASE_X : CHARACTER_BASE_X;
    prevCharY.current = SCREEN_HEIGHT / 2;
    prevCharBottom.current = SCREEN_HEIGHT / 2;
    currentObstacleSpeed.current = GAME_CONFIG.OBSTACLE_SPEED;
    lastTrickTime.current = 0;
    trickCombo.current = 0;
    setComboCount(0);
    setActiveTrick(null);
    trickSpinAnim.setValue(0);
    obstacles.current = [];
    needsScoreUpdate.current = false;
    batchedScoreRef.current = 0;
    clouds.current = Array.from({ length: 2 }, (_, i) => generateCloud(i, Math.random() * SCREEN_WIDTH));
    speedMultiplier.current = 1;
    tapSpeedBonus.current = 0;
    frameCount.current = 0;
    obstacleIdCounter.current = 0;
    lastObstacleSpawn.current = 0;
    scoreRef.current = 0;
    distanceRef.current = 0;
    renderThrottleRef.current = 0;
    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
    phasePassed.current = 0;
    isFastPhase.current = true;
    phaseBlend.current = 1.0;
    phaseTransitionCounter.current = 0;
    levelRef.current = LEVELS[0];
    setCurrentLevel(LEVELS[0]);
    setShowLevelUp(false);
    lastGapY.current = SCREEN_HEIGHT / 2;
    levelUpAnim.setValue(0);
    levelUpScale.setValue(0.5);
    setScore(0);
    setDistance(0);
    setNewBadges([]);
    setCoinsEarned(0);
    setFloatingScores([]);
    setShowSplat(false);
    charAnim.setValue(SCREEN_HEIGHT / 2);
    charXAnim.setValue(0);
    charRotation.setValue(0);
    charStretchX.setValue(1);
    charStretchY.setValue(1);
    charWobble.setValue(0);
    trajectoryOpacity.setValue(0);
    if (trajectoryFade.current) { trajectoryFade.current.stop(); trajectoryFade.current = null; }
    prevVelSign.current = 0;
    gameOverOpacity.setValue(0);
    gameOverScale.setValue(0.8);
    setGameStatus('ready');
  }, [charAnim, charXAnim, charRotation, charStretchX, charStretchY, charWobble, trajectoryOpacity, gameOverOpacity, gameOverScale, levelUpAnim, levelUpScale, isNeonMap, trickSpinAnim, setGameStatus, setActiveTrick]);

  const handleHome = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void audioManager.stopMusic();
    router.back();
  }, [router]);

  const trajectoryDots = useMemo(() => {
    const dotCount = 4;
    const dots: { offsetY: number; offsetX: number; size: number; opacity: number }[] = [];
    const curVel = velocity.current;
    const grav = (levelRef.current?.fastGravity ?? 0.36) * (movementProfileRef.current?.gravityMultiplier ?? 1);
    let simVel = curVel;
    let simY = 0;
    const charSize = GAME_CONFIG.CHARACTER_SIZE;
    const speed = currentObstacleSpeed.current || GAME_CONFIG.OBSTACLE_SPEED;
    for (let i = 0; i < dotCount; i++) {
      const steps = (i + 1) * 3;
      for (let s = 0; s < 3; s++) {
        simVel += grav;
        simVel = Math.min(simVel, GAME_CONFIG.MAX_FALL_VELOCITY);
        simY += simVel;
      }
      const t = (i + 1) / dotCount;
      dots.push({
        offsetY: simY,
        offsetX: speed * steps * 0.3,
        size: Math.max(3, charSize * (0.14 - t * 0.025)),
        opacity: 0.4 * (1 - t * 0.7),
      });
    }
    return dots;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTick]);

  const blobColor = currentSkin?.bodyColor ?? '#FFD84A';

  const charRotateDeg = charRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-22deg', '0deg', '20deg'],
  });

  const charWobbleDeg = charWobble.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`-${movementProfile.wobbleAmount}deg`, '0deg', `${movementProfile.wobbleAmount}deg`],
  });

  const formattedDist = useFormattedDistance(distance);

  const skyLayerTranslate = skyShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const buildingPalettes = useMemo(() => mapTheme.obstacles.palettes, [mapTheme]);

  const pipeOutline = useMemo(() => mapTheme.obstacles.outline, [mapTheme]);



  const renderedObstacles = useMemo(() => {
    const visibleObs = obstacles.current;
    const len = visibleObs.length;
    const result: React.ReactNode[] = [];
    const oc = pipeOutline;
    const bw = POLE_BORDER;

    for (let idx = 0; idx < len; idx++) {
      const o = visibleObs[idx];
      if (o.x < -POLE_CAP_W - 20 || o.x > SCREEN_WIDTH + POLE_CAP_W + 20) continue;
      const palette = buildingPalettes[o.id % buildingPalettes.length];
      const gap = o.gapSize ?? GAME_CONFIG.OBSTACLE_GAP;
      const gapStart = o.gapY - gap / 2;
      const gapEnd = o.gapY + gap / 2;
      const floorY = SCREEN_HEIGHT - GROUND_HEIGHT;

      const capLeft = o.x - POLE_CAP_W / 2;
      const shaftLeft = o.x - POLE_SHAFT_W / 2;
      const baseLeft = o.x - POLE_BASE_W / 2;

      const topCapTop = gapStart - POLE_CAP_H;
      const topShaftH = Math.max(0, topCapTop);

      const botCapTop = gapEnd;
      const botShaftTop = gapEnd + POLE_CAP_H;
      const botShaftH = Math.max(0, floorY - botShaftTop - POLE_BASE_H);
      const botBaseTop = botShaftTop + botShaftH;

      result.push(
        <View key={o.id} style={styles.obstacleGroup}>
          <View style={{
            position: 'absolute' as const, left: shaftLeft, top: 0,
            width: POLE_SHAFT_W, height: topShaftH,
            backgroundColor: palette.body, borderColor: oc,
            borderLeftWidth: bw, borderRightWidth: bw,
          }} />
          <View style={{
            position: 'absolute' as const, left: capLeft, top: topCapTop,
            width: POLE_CAP_W, height: POLE_CAP_H,
            backgroundColor: palette.ledge, borderColor: oc,
            borderWidth: bw, borderRadius: POLE_CAP_RADIUS,
          }} />
          <View style={{
            position: 'absolute' as const, left: capLeft, top: botCapTop,
            width: POLE_CAP_W, height: POLE_CAP_H,
            backgroundColor: palette.ledge, borderColor: oc,
            borderWidth: bw, borderRadius: POLE_CAP_RADIUS,
          }} />
          <View style={{
            position: 'absolute' as const, left: shaftLeft, top: botShaftTop,
            width: POLE_SHAFT_W, height: botShaftH,
            backgroundColor: palette.body, borderColor: oc,
            borderLeftWidth: bw, borderRightWidth: bw,
          }} />
          <View style={{
            position: 'absolute' as const, left: baseLeft, top: botBaseTop,
            width: POLE_BASE_W, height: POLE_BASE_H,
            backgroundColor: palette.body, borderColor: oc,
            borderWidth: bw, borderTopWidth: 0,
            borderBottomLeftRadius: POLE_SHAFT_RADIUS, borderBottomRightRadius: POLE_SHAFT_RADIUS,
            opacity: 0.85,
          }} />
        </View>
      );
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTick, buildingPalettes, pipeOutline]);

  const renderedClouds = useMemo(() => {
    if (!mapTheme.clouds.visible) return null;
    return clouds.current.map(c => (
      <View
        key={c.id}
        style={[
          styles.gameCloud,
          {
            left: c.x,
            top: c.y,
            opacity: mapTheme.clouds.opacity,
            transform: [{ scale: c.scale }],
          },
        ]}
      >
        <View style={[styles.gcPart1, { backgroundColor: mapTheme.clouds.color }]} />
        <View style={[styles.gcPart2, { backgroundColor: mapTheme.clouds.color }]} />
      </View>
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTick, mapTheme]);



  const splatColors = useMemo(() => {
    const base = currentSkin?.bodyColor ?? '#FFD84A';
    return [base, base + 'CC', base + '99', '#FFE97A', base];
  }, [currentSkin?.bodyColor]);

  const splatSizes = useMemo(() => {
    return Array.from({ length: 5 }, () => scale(8 + Math.random() * 6));
  }, []);

  const bgBuildings = useMemo(() => (
    <View style={styles.bgBuildingRow} pointerEvents="none">
      <View style={[styles.bgBuilding, { height: verticalScale(70), width: scale(34), left: scale(10), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.5 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(100), width: scale(28), left: scale(20), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(145), width: scale(22), left: scale(65), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.9 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(85), width: scale(30), left: scale(100), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.6 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(125), width: scale(20), left: scale(150), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(160), width: scale(18), left: scale(200), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 1.1 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(95), width: scale(26), left: scale(245), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.7 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(135), width: scale(16), left: scale(290), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(110), width: scale(24), left: scale(330), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.8 }]} />
      <View style={[styles.bgBuilding, { height: verticalScale(80), width: scale(20), left: scale(370), backgroundColor: mapTheme.bgBuildings.color, opacity: mapTheme.bgBuildings.opacity * 0.6 }]} />
      {mapTheme.id === 'gotham' && (
        <>
          <View style={[styles.bgBuilding, { height: verticalScale(175), width: scale(16), left: scale(45), backgroundColor: '#080818', opacity: 0.6 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(140), width: scale(20), left: scale(120), backgroundColor: '#080818', opacity: 0.55 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(190), width: scale(14), left: scale(185), backgroundColor: '#080818', opacity: 0.65 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(110), width: scale(22), left: scale(260), backgroundColor: '#080818', opacity: 0.5 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(155), width: scale(12), left: scale(340), backgroundColor: '#080818', opacity: 0.58 }]} />
          <View style={styles.gothamMoonGlow} />
          <View style={styles.gothamMoon} />
        </>
      )}
      {mapTheme.id === 'neon' && (
        <>
          <View style={[styles.bgBuilding, { height: verticalScale(180), width: scale(14), left: scale(55), backgroundColor: '#0A0520', opacity: 0.7 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(150), width: scale(18), left: scale(135), backgroundColor: '#0A0520', opacity: 0.6 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(200), width: scale(12), left: scale(215), backgroundColor: '#0A0520', opacity: 0.75 }]} />
          <View style={[styles.bgBuilding, { height: verticalScale(120), width: scale(20), left: scale(305), backgroundColor: '#0A0520', opacity: 0.55 }]} />
        </>
      )}
    </View>
  ), [mapTheme]);

  const neonZoneOverlayEl = useMemo(() => {
    if (!isNeonMap) return null;
    return (
      <View style={styles.neonZoneOverlay} pointerEvents="none">
        <View style={[styles.neonZoneLabel, styles.neonZoneTop]}>
          <View style={styles.neonZoneLabelRow}>
            <BoostIcon size={moderateScale(16)} color={TRICKS.boost.color} />
            <Text style={[styles.neonZoneLabelText, { color: TRICKS.boost.color }]}>BOOST</Text>
          </View>
        </View>
        <View style={styles.neonZoneMiddleRow}>
          <View style={[styles.neonZoneLabel, styles.neonZoneSide]}>
            <BarrelIcon size={moderateScale(16)} color={TRICKS.barrel_left.color} />
          </View>
          <View style={[styles.neonZoneLabel, styles.neonZoneCenter]}>
            <SuperFlapIcon size={moderateScale(16)} color={TRICKS.super_flap.color} />
          </View>
          <View style={[styles.neonZoneLabel, styles.neonZoneSide]}>
            <SpinIcon size={moderateScale(16)} color={TRICKS.barrel_right.color} />
          </View>
        </View>
        <View style={[styles.neonZoneLabel, styles.neonZoneBottom]}>
          <View style={styles.neonZoneLabelRow}>
            <DiveIcon size={moderateScale(16)} color={TRICKS.dive.color} />
            <Text style={[styles.neonZoneLabelText, { color: TRICKS.dive.color }]}>DIVE</Text>
          </View>
        </View>
      </View>
    );
  }, [isNeonMap]);

  const groundStrip = useMemo(() => (
    <View style={[styles.groundStrip, { height: GROUND_HEIGHT }]}>
      <View style={[styles.groundGrass, { backgroundColor: mapTheme.ground.top }]} />
      <View style={[styles.groundDirt, { backgroundColor: mapTheme.ground.bottom }]} />
      <View style={[styles.groundLine, { backgroundColor: mapTheme.ground.line }]} />
    </View>
  ), [mapTheme]);

  const hudPillStyle = useMemo(() => ({
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  }), []);

  return (
    <View style={[styles.container, { backgroundColor: mapTheme.sky.base }]}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.skyLayer1, { backgroundColor: mapTheme.sky.layer1 }]} />
      <Animated.View style={[styles.skyLayer2, { backgroundColor: mapTheme.sky.layer2, transform: [{ translateY: skyLayerTranslate }] }]} />
      <View style={[styles.skyLayer3, { backgroundColor: mapTheme.sky.layer3 }]} />
      <View style={[styles.skyHorizonGlow, { backgroundColor: mapTheme.sky.horizonGlow, opacity: mapTheme.sky.horizonOpacity }]} />
      {bgBuildings}

      <Animated.View
        style={[
          styles.gameWorld,
          {
            transform: [
              { translateX: shakeX },
              { translateY: shakeY },
            ],
          },
        ]}
      >
        <Pressable onPressIn={(e) => handleTapRef.current(e)} testID="game-touch-area" style={styles.touchArea}>
            {renderedClouds}
            {renderedObstacles}

            {groundStrip}

            {gameStatus === 'playing' && trajectoryDots.map((dot, i) => (
              <Animated.View
                key={`tdot-${i}`}
                pointerEvents="none"
                style={{
                  position: 'absolute' as const,
                  left: baseX + dot.offsetX - dot.size / 2,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                  backgroundColor: blobColor,
                  opacity: Animated.multiply(trajectoryOpacity, dot.opacity),
                  transform: [{ translateY: Animated.add(charAnim, dot.offsetY + GAME_CONFIG.CHARACTER_SIZE / 2) }],
                }}
              />
            ))}

            <Animated.View
              style={[
                styles.character,
                {
                  top: 0,
                  left: baseX - GAME_CONFIG.CHARACTER_SIZE / 2,
                  transform: [
                    { translateX: charXAnim },
                    { translateY: charAnim },
                    { rotate: charRotateDeg },
                    { rotate: charWobbleDeg },
                    { scale: charScale },
                    { scaleX: charStretchX },
                    { scaleY: charStretchY },
                  ],
                },
              ]}
            >
              <Animated.View style={isNeonMap ? {
                transform: [{ rotate: trickSpinAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-360deg', '0deg', '360deg'] }) }],
              } : undefined}>
                <GameBlobSkin skinData={currentSkin} />
              </Animated.View>
            </Animated.View>

            {showSplat && (
              <View
                style={[
                  styles.splatContainer,
                  {
                    left: splatPosition.current.x - 40,
                    top: splatPosition.current.y - 40,
                  },
                ]}
                pointerEvents="none"
              >
                {splatAnims.map((s, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.splatDot,
                      {
                        backgroundColor: splatColors[i % splatColors.length],
                        width: splatSizes[i],
                        height: splatSizes[i],
                        borderRadius: scale(6),
                        transform: [
                          { translateX: s.x },
                          { translateY: s.y },
                          { scale: s.scale },
                        ],
                        opacity: s.opacity,
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {floatingScores.map(fs => (
              <Animated.View
                key={fs.id}
                style={[
                  styles.floatingScore,
                  {
                    left: fs.x - 15,
                    top: fs.y - 20,
                    transform: [{ translateY: fs.anim }],
                    opacity: fs.opacityAnim,
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.floatingScoreText}>+1</Text>
              </Animated.View>
            ))}

            {showLevelUp && (
              <Animated.View
                style={[
                  styles.levelUpOverlay,
                  {
                    opacity: levelUpAnim,
                    transform: [{ scale: levelUpScale }],
                  },
                ]}
                pointerEvents="none"
              >
                <View style={[styles.levelUpCard, { borderColor: currentLevel.color + '80', shadowColor: currentLevel.color }]}>
                  <View style={[styles.levelUpGlow, { backgroundColor: currentLevel.color + '15' }]} />
                  <Text style={[styles.levelUpTitle, { color: currentLevel.color }]}>LEVEL {currentLevel.level}</Text>
                  <Text style={styles.levelUpName}>{currentLevel.name}</Text>
                </View>
              </Animated.View>
            )}

            {gameStatus === 'playing' && neonZoneOverlayEl}

            {activeTrick && (
              <Animated.View
                style={[
                  styles.trickLabelOverlay,
                  {
                    opacity: trickLabelAnim,
                    transform: [{ scale: trickLabelScale }],
                  },
                ]}
                pointerEvents="none"
              >
                <View style={[styles.trickLabelCard, { borderColor: activeTrick.info.color, shadowColor: activeTrick.info.color }]}>
                  <TrickIcon type={activeTrick.info.emoji} size={moderateScale(18)} color={activeTrick.info.color} />
                  <Text style={[styles.trickLabelText, { color: activeTrick.info.color }]}>{activeTrick.info.name}</Text>
                </View>
              </Animated.View>
            )}

            {isNeonMap && comboCount > 1 && (
              <Animated.View
                style={[
                  styles.comboOverlay,
                  { opacity: comboAnim, transform: [{ scale: comboAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] },
                ]}
                pointerEvents="none"
              >
                <View style={styles.comboBadge}>
                  <Text style={styles.comboText}>{comboCount}x COMBO</Text>
                </View>
              </Animated.View>
            )}

            {gameStatus === 'ready' && (
              <View style={styles.readyOverlay}>
                <Animated.View style={{ transform: [{ scale: readyPulse }] }}>
                  <View style={styles.readyCard}>
                    <Text style={styles.readyText}>Tap to start</Text>
                    <Text style={styles.readySubtext}>{isNeonMap ? 'Tap zones for tricks!' : 'Tap left or right to steer'}</Text>
                    {isNeonMap && (
                      <View style={styles.readyTrickHints}>
                        <View style={styles.readyHintRow}>
                          <BoostIcon size={moderateScale(14)} color="rgba(255,255,255,0.55)" />
                          <Text style={styles.readyHintLine}>Top = Boost</Text>
                          <DiveIcon size={moderateScale(14)} color="rgba(255,255,255,0.55)" />
                          <Text style={styles.readyHintLine}>Bottom = Dive</Text>
                        </View>
                        <View style={styles.readyHintRow}>
                          <BarrelIcon size={moderateScale(14)} color="rgba(255,255,255,0.55)" />
                          <Text style={styles.readyHintLine}>Left = Barrel</Text>
                          <SpinIcon size={moderateScale(14)} color="rgba(255,255,255,0.55)" />
                          <Text style={styles.readyHintLine}>Right = Spin</Text>
                        </View>
                        <View style={styles.readyHintRow}>
                          <SuperFlapIcon size={moderateScale(14)} color="rgba(255,255,255,0.55)" />
                          <Text style={styles.readyHintLine}>Center = Super Flap</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </Animated.View>
              </View>
            )}
        </Pressable>

        <View style={[styles.hud, { paddingTop: safeTop + verticalScale(4) }]} pointerEvents="box-none">
          <View style={styles.hudRow} pointerEvents="box-none">
            <TouchableOpacity
              style={[styles.hudPill, hudPillStyle]}
              onPress={handlePause}
              testID="pause-button"
              activeOpacity={0.7}
            >
              {gameStatus === 'paused' ? (
                <Play size={moderateScale(15)} color={GameColors.uiWhite} fill={GameColors.uiWhite} />
              ) : (
                <Pause size={moderateScale(15)} color={GameColors.uiWhite} fill={GameColors.uiWhite} />
              )}
            </TouchableOpacity>

            <View style={[styles.hudCenter, hudPillStyle]}>
              <Animated.Text
                style={[
                  styles.hudScore,
                  { transform: [{ scale: scorePopScale }] },
                ]}
              >
                {score}
              </Animated.Text>
              <View style={[styles.hudLevelDot, { backgroundColor: currentLevel.color + 'CC' }]}>
                <Text style={styles.hudLevelText}>LV{currentLevel.level}</Text>
              </View>
            </View>

            <View style={styles.hudRightGroup}>
              <TouchableOpacity
                style={[styles.hudPill, styles.hudMusicBtn]}
                onPress={handleMusicToggle}
                activeOpacity={0.7}
                testID="music-toggle"
              >
                {musicOn ? (
                  <Volume2 size={moderateScale(14)} color={GameColors.uiYellow} />
                ) : (
                  <VolumeX size={moderateScale(14)} color="rgba(255,255,255,0.4)" />
                )}
              </TouchableOpacity>
              <View style={[styles.hudPill, hudPillStyle]}>
                <Ruler size={moderateScale(13)} color={GameColors.uiYellow} />
                <Text style={styles.hudPillText}>{formattedDist}</Text>
              </View>
            </View>
          </View>
        </View>

        {gameStatus === 'paused' && (
          <View style={styles.pauseOverlay}>
            <View style={[styles.pauseCard, { width: MODAL.width, maxWidth: MODAL.width }]}>
              <View style={styles.pauseCardGlow} />
              <Text style={styles.pauseTitle}>PAUSED</Text>
              <TouchableOpacity style={styles.pauseBtn} onPress={handlePause} activeOpacity={0.85}>
                <Play size={moderateScale(20)} color={GameColors.uiWhite} fill={GameColors.uiWhite} />
                <Text style={styles.pauseBtnText}>RESUME</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pauseBtn, styles.pauseBtnSecondary]} onPress={handleHome} activeOpacity={0.85}>
                <Home size={moderateScale(18)} color={GameColors.uiDark} />
                <Text style={styles.pauseBtnTextSecondary}>HOME</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {gameStatus === 'over' && (
          <Animated.View
            style={[
              styles.gameOverOverlay,
              { opacity: gameOverOpacity, paddingTop: safeTop, paddingBottom: safeBottom },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.gameOverScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              alwaysBounceVertical={false}
            >
              <Animated.View
                style={[
                  styles.gameOverCard,
                  {
                    width: MODAL.width,
                    maxWidth: MODAL.width,
                    transform: [{ scale: gameOverScale }],
                  },
                ]}
              >
                <View style={styles.goCardTopAccent} />
                <Text style={styles.gameOverTitle}>Splat!</Text>
                <Text style={styles.gameOverSubtitle}>You crashed into a building!</Text>
                <View style={[styles.goLevelReached, { backgroundColor: currentLevel.color + '15', borderColor: currentLevel.color + '40' }]}>
                  <Text style={[styles.goLevelReachedText, { color: currentLevel.color }]}>Level {currentLevel.level} — {currentLevel.name}</Text>
                </View>

                <View style={styles.goStatsRow}>
                  <View style={styles.goStatItem}>
                    <View style={[styles.goStatIcon, { backgroundColor: '#FFF3D4' }]}>
                      <Trophy size={moderateScale(16)} color={GameColors.uiOrange} />
                    </View>
                    <Text style={styles.goStatValue}>{score}</Text>
                    <Text style={styles.goStatLabel}>SCORE</Text>
                  </View>
                  <View style={styles.goStatItem}>
                    <View style={[styles.goStatIcon, { backgroundColor: '#FFF8D4' }]}>
                      <Star size={moderateScale(16)} color={GameColors.badgeGold} fill={GameColors.badgeGold} />
                    </View>
                    <Text style={styles.goStatValue}>{Math.max(stats.bestScore, score)}</Text>
                    <Text style={styles.goStatLabel}>BEST</Text>
                  </View>
                  <View style={styles.goStatItem}>
                    <View style={[styles.goStatIcon, { backgroundColor: '#E8F4FD' }]}>
                      <Ruler size={moderateScale(16)} color={GameColors.cardBorder} />
                    </View>
                    <Text style={styles.goStatValue}>{formattedDist}</Text>
                    <Text style={styles.goStatLabel}>DIST</Text>
                  </View>
                </View>

                {coinsEarned > 0 && (
                  <View style={styles.coinsEarnedRow}>
                    <Coins size={moderateScale(18)} color="#D4920B" />
                    <Text style={styles.coinsEarnedText}>+{coinsEarned}</Text>
                    <Text style={styles.coinsEarnedLabel}>coins earned</Text>
                  </View>
                )}

                {newBadges.length > 0 && (
                  <View style={styles.newBadgesSection}>
                    <Text style={styles.newBadgesTitle}>New Badges!</Text>
                    <View style={styles.badgeRow}>
                      {newBadges.map(bId => {
                        const badge = BADGES.find(b => b.id === bId);
                        if (!badge) return null;
                        return (
                          <View key={bId} style={[styles.badgeChip, { backgroundColor: badge.color + '20' }]}>
                            <Text style={styles.badgeIcon}>{badge.icon}</Text>
                            <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                <View style={styles.goButtons}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleRestart}
                    testID="retry-button"
                    activeOpacity={0.85}
                  >
                    <View style={styles.retryButtonHighlight} />
                    <RotateCcw size={moderateScale(20)} color={GameColors.uiWhite} />
                    <Text style={styles.retryText}>TRY AGAIN</Text>
                  </TouchableOpacity>
                  <View style={styles.goBottomRow}>
                    <TouchableOpacity
                      style={styles.homeButton}
                      onPress={handleHome}
                      testID="home-button"
                      activeOpacity={0.85}
                    >
                      <Home size={moderateScale(18)} color={GameColors.uiDark} />
                      <Text style={styles.homeText}>HOME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleShareGameOver}
                      activeOpacity={0.85}
                      testID="share-game-over"
                    >
                      <Animated.View style={[styles.shareButton, { transform: [{ scale: shareScaleAnim }] }]}>
                        <CupSoda size={moderateScale(16)} color={GameColors.uiWhite} />
                        <Text style={styles.shareText}>SHARE</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}
