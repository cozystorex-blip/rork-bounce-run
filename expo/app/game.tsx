import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, RotateCcw, Home, Pause, Volume2, VolumeX, Trophy, Coins } from 'lucide-react-native';
import { useGameState } from '@/providers/GameStateProvider';
import { BlobCharacter } from '@/components/BlobCharacter';
import { GAME_CONFIG, OBSTACLE_TUNING, BLOCK_COLOR_PAIRS, LEVELS, getLevelForScore } from '@/constants/game';
import { getSkinById } from '@/constants/skins';
import { getMapById } from '@/constants/maps';
import { scale, verticalScale, moderateScale, SCREEN, GROUND_HEIGHT } from '@/constants/layout';
import { audioManager } from '@/utils/audio';

const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

const POLE_CAP_W = scale(OBSTACLE_TUNING.PIPE_WIDTH);
const POLE_CAP_H = scale(OBSTACLE_TUNING.PIPE_CAP_HEIGHT);
const POLE_SHAFT_W = POLE_CAP_W * 0.72;
const POLE_BASE_W = POLE_CAP_W * 0.85;
const POLE_BASE_H = scale(8);
const POLE_CAP_RADIUS = scale(4);
const POLE_SHAFT_RADIUS = scale(3);

type GameStatus = 'idle' | 'playing' | 'dead';

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

interface BuildingPalette {
  body: string;
  ledge: string;
}

const buildingPalettes: BuildingPalette[] = [
  { body: '#D35400', ledge: '#E67E22' },
  { body: '#C0392B', ledge: '#E74C3C' },
  { body: '#2980B9', ledge: '#3498DB' },
  { body: '#27AE60', ledge: '#2ECC71' },
  { body: '#8E44AD', ledge: '#9B59B6' },
  { body: '#16A085', ledge: '#1ABC9C' },
  { body: '#2C3E50', ledge: '#34495E' },
  { body: '#F39C12', ledge: '#F1C40F' },
];

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, submitScore } = useGameState();

  const skin = useMemo(() => getSkinById(stats.selectedSkin), [stats.selectedSkin]);
  const currentMap = useMemo(() => getMapById(stats.selectedMap), [stats.selectedMap]);
  const mp = skin.physics;

  const safeTop = Math.max(insets.top, 20);

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState<number>(0);
  const [displayCoins, setDisplayCoins] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [renderTick, setRenderTick] = useState<number>(0);

  const gameStatusRef = useRef<GameStatus>('idle');
  const scoreRef = useRef<number>(0);
  const coinsEarnedRef = useRef<number>(0);
  const levelRef = useRef(LEVELS[0]);
  const isPausedRef = useRef(false);

  const characterY = useRef<number>(SCREEN_HEIGHT / 2);
  const velocity = useRef<number>(0);
  const obstacles = useRef<Obstacle[]>([]);
  const lastGapY = useRef<number>(SCREEN_HEIGHT / 2);
  const obstacleIdCounter = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const renderThrottleRef = useRef<number>(0);

  const charAnim = useRef(new Animated.Value(SCREEN_HEIGHT / 2)).current;
  const charScale = useRef(new Animated.Value(1)).current;
  const charRotate = useRef(new Animated.Value(0)).current;
  const deathOverlayOpacity = useRef(new Animated.Value(0)).current;
  const scorePopScale = useRef(new Animated.Value(1)).current;
  const hudOpacity = useRef(new Animated.Value(1)).current;

  const getCharX = useCallback(() => {
    return SCREEN_WIDTH * GAME_CONFIG.CHARACTER_X_PERCENT;
  }, []);

  const spawnObstacle = useCallback(() => {
    const lvl = levelRef.current;
    const gapSize = lvl.fastGap;
    const ceilingY = safeTop;
    const floorY = SCREEN_HEIGHT - GROUND_HEIGHT;
    const gapCenterMin = ceilingY + OBSTACLE_TUNING.GAP_CENTER_MIN_PADDING + gapSize / 2;
    const gapCenterMax = floorY - OBSTACLE_TUNING.GAP_CENTER_MAX_PADDING - gapSize / 2;
    const safeMin = Math.min(gapCenterMin, gapCenterMax);
    const safeMax = Math.max(gapCenterMin, gapCenterMax);
    const shiftFactor = 0.45 + (lvl.level - 1) * 0.06;
    const maxShift = (safeMax - safeMin) * Math.min(shiftFactor, 0.8);
    const targetY = lastGapY.current + (Math.random() - 0.5) * maxShift * 2;
    const gapCenter = Math.max(safeMin, Math.min(safeMax, targetY));
    lastGapY.current = gapCenter;
    const pair = BLOCK_COLOR_PAIRS[obstacleIdCounter.current % BLOCK_COLOR_PAIRS.length];
    const angleRange = Math.min(3 + (lvl.level - 1) * 1.2, 8);
    const pipeAngle = (Math.random() - 0.5) * angleRange;
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
    const hitSize = GAME_CONFIG.CHARACTER_SIZE * GAME_CONFIG.HITBOX_SHRINK;
    const cx = getCharX();
    const insetX = scale(OBSTACLE_TUNING.HITBOX_INSET_X);
    const insetY = scale(OBSTACLE_TUNING.HITBOX_INSET_Y);
    const forgive = scale(OBSTACLE_TUNING.PLAYER_FORGIVENESS);
    const halfHit = hitSize / 2;
    const charLeft = cx - halfHit + forgive;
    const charRight = cx + halfHit - forgive;
    const charTop = cy - halfHit + forgive;
    const charBottom = cy + halfHit - forgive;

    const ceilingY = safeTop;
    const floorY = SCREEN_HEIGHT - GROUND_HEIGHT;
    if (charTop <= ceilingY || charBottom >= floorY) {
      return true;
    }

    const capHalfW = POLE_CAP_W / 2;

    for (let oi = 0; oi < obs.length; oi++) {
      const o = obs[oi];
      const gap = o.gapSize ?? GAME_CONFIG.OBSTACLE_GAP;
      const gapStart = o.gapY - gap / 2;
      const gapEnd = o.gapY + gap / 2;

      const pipeLeft = o.x - capHalfW + insetX;
      const pipeRight = o.x + capHalfW - insetX;

      if (charRight > pipeLeft && charLeft < pipeRight) {
        if (charTop < gapStart + insetY) return true;
        if (charBottom > gapEnd - insetY) return true;
      }
    }
    return false;
  }, [safeTop, getCharX]);

  const handleDeath = useCallback(() => {
    if (gameStatusRef.current === 'dead') return;
    gameStatusRef.current = 'dead';
    setGameStatus('dead');

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void audioManager.playDeath();

    submitScore(scoreRef.current, coinsEarnedRef.current);

    Animated.timing(deathOverlayOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    console.log(`[Game] Death. Score: ${scoreRef.current}, Coins: ${coinsEarnedRef.current}`);
  }, [deathOverlayOpacity, submitScore]);

  const gameLoop = useCallback(() => {
    if (gameStatusRef.current !== 'playing' || isPausedRef.current) {
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const now = performance.now();
    const dt = lastFrameTime.current ? Math.min((now - lastFrameTime.current) / 16.67, 2.5) : 1;
    lastFrameTime.current = now;

    const lvl = levelRef.current;

    velocity.current += lvl.fastGravity * mp.gravityMultiplier * dt;
    velocity.current *= mp.fallDamping;
    if (velocity.current > GAME_CONFIG.MAX_FALL_VELOCITY) {
      velocity.current = GAME_CONFIG.MAX_FALL_VELOCITY;
    }

    if (velocity.current < 0) {
      const riseEase = 1.0 - Math.min(0.35, Math.abs(velocity.current) * 0.012);
      const riseSpeed = velocity.current * riseEase * (1.0 + (1.0 - mp.riseSmoothing) * 0.15);
      characterY.current += riseSpeed * dt;
    } else {
      const fallEase = 1.0 - Math.max(0, (velocity.current - 3) * 0.02);
      characterY.current += velocity.current * Math.max(0.85, fallEase) * dt;
    }

    const tiltTarget = Math.max(-1, Math.min(1, velocity.current / 6));
    charRotate.setValue(tiltTarget);

    const cx = getCharX();
    const speed = lvl.fastSpeed * dt;

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      obstacles.current[i].x -= speed;
      if (obstacles.current[i].x < -POLE_CAP_W - 40) {
        obstacles.current.splice(i, 1);
        continue;
      }

      if (!obstacles.current[i].passed && obstacles.current[i].x + POLE_CAP_W / 2 < cx) {
        obstacles.current[i].passed = true;
        scoreRef.current += 1;
        coinsEarnedRef.current += GAME_CONFIG.COINS_PER_SCORE;
        setScore(scoreRef.current);
        setDisplayCoins(coinsEarnedRef.current);

        const newLevel = getLevelForScore(scoreRef.current);
        if (newLevel.level !== levelRef.current.level) {
          levelRef.current = newLevel;
          setCurrentLevel(newLevel.level);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          console.log(`[Game] Level up! Now level ${newLevel.level}: ${newLevel.label}`);
        }

        void audioManager.playScore();
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        scorePopScale.setValue(1.3);
        Animated.spring(scorePopScale, {
          toValue: 1,
          friction: 4,
          tension: 180,
          useNativeDriver: true,
        }).start();
      }
    }

    if (now - lastSpawnTime.current > GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL / (lvl.fastSpeed / 3)) {
      spawnObstacle();
      lastSpawnTime.current = now;
    }

    if (checkCollision(characterY.current, obstacles.current)) {
      handleDeath();
      return;
    }

    charAnim.setValue(characterY.current);

    renderThrottleRef.current++;
    if (renderThrottleRef.current >= 1) {
      renderThrottleRef.current = 0;
      setRenderTick(t => t + 1);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [charAnim, charRotate, scorePopScale, getCharX, checkCollision, handleDeath, spawnObstacle, mp]);

  const startGame = useCallback(() => {
    characterY.current = SCREEN_HEIGHT / 2;
    velocity.current = 0;
    obstacles.current = [];
    obstacleIdCounter.current = 0;
    scoreRef.current = 0;
    coinsEarnedRef.current = 0;
    lastGapY.current = SCREEN_HEIGHT / 2;
    lastSpawnTime.current = performance.now();
    lastFrameTime.current = 0;
    levelRef.current = LEVELS[0];

    setScore(0);
    setDisplayCoins(0);
    setCurrentLevel(1);
    setIsPaused(false);
    isPausedRef.current = false;

    charAnim.setValue(SCREEN_HEIGHT / 2);
    charScale.setValue(1);
    charRotate.setValue(0);
    deathOverlayOpacity.setValue(0);
    hudOpacity.setValue(1);

    gameStatusRef.current = 'playing';
    setGameStatus('playing');

    velocity.current = GAME_CONFIG.JUMP_FORCE * mp.flapForceMultiplier * 0.6;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }

    console.log('[Game] Started. Skin:', skin.id, 'Map:', currentMap.id);
  }, [charAnim, charScale, charRotate, deathOverlayOpacity, hudOpacity, gameLoop, mp, skin.id, currentMap.id]);

  const handleTap = useCallback(() => {
    if (gameStatusRef.current === 'idle') {
      startGame();
      return;
    }
    if (gameStatusRef.current === 'dead') return;
    if (isPausedRef.current) return;

    velocity.current = levelRef.current.fastJump * mp.flapForceMultiplier * 1.05;
    charAnim.setValue(characterY.current);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    charScale.stopAnimation();
    Animated.sequence([
      Animated.timing(charScale, { toValue: mp.flapSquashX * 1.05, duration: Math.max(20, mp.flapSquashDuration * 0.5), useNativeDriver: true }),
      Animated.spring(charScale, { toValue: 1, friction: mp.flapSpringFriction, tension: mp.flapSpringTension * 1.2, useNativeDriver: true }),
    ]).start();
  }, [startGame, charAnim, charScale, mp]);

  const handlePause = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (gameStatusRef.current === 'playing') {
      isPausedRef.current = !isPausedRef.current;
      setIsPaused(isPausedRef.current);
    }
  }, []);

  const handleRestart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startGame();
  }, [startGame]);

  const handleGoHome = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void audioManager.stopMusic();
    router.back();
  }, [router]);

  const handleToggleMusic = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const enabled = await audioManager.toggleMusic();
    setMusicOn(enabled);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      void audioManager.stopMusic();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [gameLoop]);

  const renderObstacles = useMemo(() => {
    const visibleObs = obstacles.current;
    const len = visibleObs.length;
    const result: React.ReactElement[] = [];
    const oc = currentMap.obstacleOutline;
    const bw = scale(2);

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
            borderWidth: bw, borderRadius: POLE_CAP_RADIUS, zIndex: 2,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18, shadowRadius: 3, elevation: 3,
          }} />
          <View style={{
            position: 'absolute' as const,
            left: capLeft + bw + scale(3), top: topCapTop + bw + scale(1),
            width: POLE_CAP_W - bw * 2 - scale(6), height: scale(3),
            backgroundColor: 'rgba(255,255,255,0.32)', borderRadius: scale(2), zIndex: 3,
          }} />

          <View style={{
            position: 'absolute' as const, left: capLeft, top: botCapTop,
            width: POLE_CAP_W, height: POLE_CAP_H,
            backgroundColor: palette.ledge, borderColor: oc,
            borderWidth: bw, borderRadius: POLE_CAP_RADIUS, zIndex: 2,
            shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.18, shadowRadius: 3, elevation: 3,
          }} />
          <View style={{
            position: 'absolute' as const,
            left: capLeft + bw + scale(3), top: botCapTop + bw + scale(1),
            width: POLE_CAP_W - bw * 2 - scale(6), height: scale(3),
            backgroundColor: 'rgba(255,255,255,0.32)', borderRadius: scale(2), zIndex: 3,
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
  }, [renderTick, currentMap.obstacleOutline]);

  const isNewHighScore = gameStatus === 'dead' && scoreRef.current >= stats.highScore && scoreRef.current > 0;

  return (
    <View style={styles.container} testID="game-screen">
      <StatusBar barStyle="light-content" />

      <View style={[styles.sky, { backgroundColor: currentMap.skyTop }]} />
      <View style={[styles.skyBottom, { backgroundColor: currentMap.skyBottom }]} />

      <TouchableWithoutFeedback onPress={handleTap} testID="game-tap-area">
        <View style={styles.gameArea}>
          {renderObstacles}

          <Animated.View
            style={[
              styles.character,
              {
                top: 0,
                left: getCharX() - GAME_CONFIG.CHARACTER_SIZE / 2,
                transform: [
                  { translateY: charAnim },
                  { scale: charScale },
                ],
              },
            ]}
          >
            <BlobCharacter
              skin={skin}
              size={GAME_CONFIG.CHARACTER_SIZE}
              rotateAnim={charRotate}
              isDead={gameStatus === 'dead'}
            />
          </Animated.View>

          <View style={[styles.ground, {
            backgroundColor: currentMap.ground,
            height: GROUND_HEIGHT,
            bottom: 0,
          }]}>
            <View style={[styles.groundTop, { backgroundColor: currentMap.groundTop }]} />
            <View style={[styles.groundAccent, { backgroundColor: currentMap.groundAccent }]} />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {gameStatus !== 'idle' && (
        <Animated.View style={[styles.hud, { opacity: hudOpacity, top: safeTop + verticalScale(8) }]}>
          <View style={styles.hudLeft}>
            <Animated.View style={[styles.scorePill, { transform: [{ scale: scorePopScale }] }]}>
              <Text style={styles.scoreText}>{score}</Text>
            </Animated.View>
          </View>
          <View style={styles.hudRight}>
            <View style={styles.coinPill}>
              <Coins size={moderateScale(13)} color="#D4920B" />
              <Text style={styles.coinText}>{displayCoins}</Text>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>Lv.{currentLevel}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {gameStatus === 'playing' && (
        <View style={[styles.pauseArea, { top: safeTop + verticalScale(8) }]}>
          <TouchableOpacity style={styles.pauseBtn} onPress={handlePause} activeOpacity={0.7}>
            <Pause size={moderateScale(18)} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pauseBtn} onPress={handleToggleMusic} activeOpacity={0.7}>
            {musicOn ? (
              <Volume2 size={moderateScale(18)} color="#FFF" />
            ) : (
              <VolumeX size={moderateScale(18)} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {gameStatus === 'idle' && (
        <View style={styles.idleOverlay}>
          <View style={styles.idleCard}>
            <Text style={styles.idleTitle}>Gap Dash</Text>
            <Text style={styles.idleSubtitle}>Tap anywhere to start!</Text>
            <View style={styles.idleSkinPreview}>
              <BlobCharacter skin={skin} size={scale(80)} />
            </View>
            <Text style={styles.idleHint}>{skin.name} • {currentMap.name}</Text>
          </View>
        </View>
      )}

      {isPaused && gameStatus === 'playing' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>Paused</Text>
            <TouchableOpacity style={styles.pauseResumeBtn} onPress={handlePause} activeOpacity={0.8}>
              <Play size={moderateScale(20)} color="#FFF" />
              <Text style={styles.pauseResumeBtnText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pauseHomeBtn} onPress={handleGoHome} activeOpacity={0.8}>
              <Home size={moderateScale(16)} color="#666" />
              <Text style={styles.pauseHomeBtnText}>Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {gameStatus === 'dead' && (
        <Animated.View style={[styles.deathOverlay, { opacity: deathOverlayOpacity }]}>
          <View style={styles.deathCard}>
            {isNewHighScore && (
              <View style={styles.newHighBadge}>
                <Trophy size={moderateScale(14)} color="#FFD700" />
                <Text style={styles.newHighText}>New Best!</Text>
              </View>
            )}
            <Text style={styles.deathTitle}>Game Over</Text>

            <View style={styles.deathStatsRow}>
              <View style={styles.deathStatItem}>
                <Text style={styles.deathStatValue}>{scoreRef.current}</Text>
                <Text style={styles.deathStatLabel}>Score</Text>
              </View>
              <View style={styles.deathStatDivider} />
              <View style={styles.deathStatItem}>
                <Text style={styles.deathStatValue}>{Math.max(stats.highScore, scoreRef.current)}</Text>
                <Text style={styles.deathStatLabel}>Best</Text>
              </View>
              <View style={styles.deathStatDivider} />
              <View style={styles.deathStatItem}>
                <View style={styles.deathCoinRow}>
                  <Coins size={moderateScale(14)} color="#D4920B" />
                  <Text style={styles.deathStatValue}>+{coinsEarnedRef.current}</Text>
                </View>
                <Text style={styles.deathStatLabel}>Coins</Text>
              </View>
            </View>

            <View style={styles.deathButtons}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRestart} activeOpacity={0.8} testID="retry-button">
                <RotateCcw size={moderateScale(20)} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.retryButtonText}>Play Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} activeOpacity={0.8} testID="home-button">
                <Home size={moderateScale(18)} color="#666" />
                <Text style={styles.homeButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  skyBottom: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  gameArea: {
    flex: 1,
  },
  obstacleGroup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  character: {
    position: 'absolute',
    zIndex: 10,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
  },
  groundTop: {
    height: scale(6),
    width: '100%',
  },
  groundAccent: {
    height: scale(3),
    width: '100%',
    opacity: 0.6,
  },
  hud: {
    position: 'absolute',
    left: scale(16),
    right: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  scorePill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoreText: {
    fontSize: moderateScale(24),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: scale(16),
    gap: scale(4),
    borderWidth: 1,
    borderColor: 'rgba(255,216,74,0.3)',
  },
  coinText: {
    fontSize: moderateScale(13),
    fontWeight: '800' as const,
    color: '#FFD84A',
  },
  levelPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  levelText: {
    fontSize: moderateScale(12),
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  pauseArea: {
    position: 'absolute',
    right: scale(16),
    flexDirection: 'row',
    gap: scale(8),
    zIndex: 25,
  },
  pauseBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  idleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 30,
  },
  idleCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: scale(28),
    padding: scale(28),
    alignItems: 'center',
    width: scale(280),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  idleTitle: {
    fontSize: moderateScale(32),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: -1,
    marginBottom: verticalScale(6),
  },
  idleSubtitle: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: 'rgba(26,26,46,0.5)',
    marginBottom: verticalScale(20),
  },
  idleSkinPreview: {
    marginBottom: verticalScale(16),
  },
  idleHint: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: 'rgba(26,26,46,0.4)',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 30,
  },
  pauseCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: scale(24),
    padding: scale(28),
    alignItems: 'center',
    width: scale(260),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  pauseTitle: {
    fontSize: moderateScale(28),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    marginBottom: verticalScale(24),
  },
  pauseResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A8A4A',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(32),
    borderRadius: scale(18),
    gap: scale(10),
    width: '100%',
    marginBottom: verticalScale(12),
  },
  pauseResumeBtnText: {
    fontSize: moderateScale(17),
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  pauseHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  pauseHomeBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: '#666',
  },
  deathOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex: 30,
  },
  deathCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: scale(28),
    padding: scale(24),
    alignItems: 'center',
    width: Math.min(SCREEN_WIDTH * 0.88, 380),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
  newHighBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(5),
    borderRadius: scale(14),
    gap: scale(6),
    marginBottom: verticalScale(8),
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  newHighText: {
    fontSize: moderateScale(13),
    fontWeight: '800' as const,
    color: '#B8860B',
  },
  deathTitle: {
    fontSize: moderateScale(30),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: -0.5,
    marginBottom: verticalScale(20),
  },
  deathStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: verticalScale(24),
  },
  deathStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  deathStatDivider: {
    width: 1,
    height: verticalScale(36),
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  deathStatValue: {
    fontSize: moderateScale(24),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  deathStatLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600' as const,
    color: 'rgba(26,26,46,0.45)',
    marginTop: verticalScale(3),
  },
  deathCoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  deathButtons: {
    width: '100%',
    gap: verticalScale(10),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A8A4A',
    paddingVertical: verticalScale(16),
    borderRadius: scale(20),
    gap: scale(10),
    shadowColor: '#1A6A30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: moderateScale(18),
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    gap: scale(8),
  },
  homeButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: '#666',
  },
});
