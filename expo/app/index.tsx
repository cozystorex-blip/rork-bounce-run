import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Trophy, Ruler, Star, Play, ChevronRight, CupSoda, TreePine, Coins } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameColors } from '@/constants/colors';
import { useGameState, useFormattedDistance } from '@/providers/GameStateProvider';
import { SKINS } from '@/constants/skins';
import { MAP_THEMES } from '@/constants/maps';
import { audioManager } from '@/utils/audio';
import CloudBackground from '@/components/CloudBackground';
import GroundWave from '@/components/GroundWave';
import BlobCharacter from '@/components/BlobCharacter';
import BlobSkin from '@/components/BlobSkin';
import SkinSelector from '@/components/SkinSelector';
import ShopModal from '@/components/ShopModal';
import { SCREEN, scale, verticalScale, moderateScale, wp } from '@/constants/layout';

const SCREEN_WIDTH = SCREEN.width;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, badgeCount, currentSkin, selectMap } = useGameState();
  const formattedDistance = useFormattedDistance(stats.totalDistance);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [shopVisible, setShopVisible] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const coinScale = useRef(new Animated.Value(1)).current;

  const safeTop = Math.max(insets.top, 20);
  const safeBottom = Math.max(insets.bottom, 10);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(40)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const playScale = useRef(new Animated.Value(0)).current;
  const playBounce = useRef(new Animated.Value(1)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;
  const blobOpacity = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const castOpacity = useRef(new Animated.Value(0)).current;
  const shareScale = useRef(new Animated.Value(1)).current;
  const mapSwitchScale = useRef(new Animated.Value(1)).current;


  const selectableMaps = useMemo(() => MAP_THEMES.filter(m => m.id !== 'neon'), []);
  const mapFilteredSkins = useMemo(() => SKINS.filter(s => s.mapAffinity === stats.selectedMap), [stats.selectedMap]);

  const blobBounceAnim = useRef(new Animated.Value(0)).current;
  const blobSpinAnim = useRef(new Animated.Value(0)).current;
  const blobSquishAnim = useRef(new Animated.Value(1)).current;
  const [blobTapCount, setBlobTapCount] = useState<number>(0);
  const blobTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBlobTap = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setBlobTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        selectMap('neon');
        if (blobTapTimerRef.current) clearTimeout(blobTapTimerRef.current);
        blobTapTimerRef.current = setTimeout(() => {
          router.push('/game');
        }, 300);
      }
      return next;
    });

    blobBounceAnim.setValue(0);
    blobSpinAnim.setValue(0);
    blobSquishAnim.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(blobBounceAnim, { toValue: -18, duration: 120, useNativeDriver: true }),
        Animated.timing(blobBounceAnim, { toValue: 3, duration: 200, useNativeDriver: true }),
        Animated.timing(blobBounceAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(blobSquishAnim, { toValue: 0.75, duration: 60, useNativeDriver: true }),
        Animated.spring(blobSquishAnim, { toValue: 1, friction: 3, tension: 180, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(blobSpinAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [selectMap, router, blobBounceAnim, blobSpinAnim, blobSquishAnim]);

  const handleMapSelect = useCallback((mapId: string) => {
    if (mapId === stats.selectedMap) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(mapSwitchScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(mapSwitchScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
    selectMap(mapId);
  }, [stats.selectedMap, selectMap, mapSwitchScale]);

  const handleShareScore = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(shareScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(shareScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
    const message = `I scored ${stats.bestScore} in BlobDash! Total distance: ${formattedDistance}. Can you beat me? 🟡`;
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
  }, [stats.bestScore, formattedDistance, shareScale]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(blobOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(pillsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardsY, {
          toValue: 0,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(playScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(castOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const popTimers = [
      setTimeout(() => { void audioManager.playPop(); }, 100),
      setTimeout(() => { void audioManager.playPop(); }, 500),
      setTimeout(() => { void audioManager.playPop(); }, 900),
      setTimeout(() => { void audioManager.playPop(); }, 1400),
    ];

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playBounce, {
          toValue: 1.04,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(playBounce, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceLoop.start();
    return () => {
      bounceLoop.stop();
      popTimers.forEach(t => clearTimeout(t));
      if (blobTapTimerRef.current) clearTimeout(blobTapTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(playScale, {
      toValue: 0.92,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      router.push('/game');
    });
  };

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
      void Haptics.selectionAsync();
      Animated.spring(dotAnim, { toValue: page, friction: 6, tension: 80, useNativeDriver: true }).start();
    }
  }, [currentPage, dotAnim]);

  const logoSpin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '0deg'],
  });

  const dot0Scale = dotAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.8, 1.3, 0.8],
    extrapolate: 'clamp',
  });
  const dot1Scale = dotAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.8, 1.3, 0.8],
    extrapolate: 'clamp',
  });
  const dot0Opacity = dotAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });
  const dot1Opacity = dotAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.4, 1, 0.4],
    extrapolate: 'clamp',
  });

  const groundOffset = verticalScale(120);
  const dotsBottom = safeBottom + groundOffset + verticalScale(12);
  const footerBottom = dotsBottom + verticalScale(24);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.pager}
      >
        <View style={styles.page}>
          <View style={styles.skyGradientTop} />
          <View style={styles.skyGradientMid} />
          <CloudBackground />

          <View style={[styles.topBar, { paddingTop: safeTop + verticalScale(8) }]}>
            <TouchableOpacity onPress={handleBlobTap} activeOpacity={0.7} testID="blob-secret-tap">
              <Animated.View style={[styles.blobTopLeft, { opacity: blobOpacity }]}>
                <Animated.View style={[
                  styles.blobAvatarRing,
                  {
                    transform: [
                      { translateY: blobBounceAnim },
                      { scale: blobSquishAnim },
                      { rotate: blobSpinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                    ],
                  },
                ]}>
                  <View style={styles.blobAvatarInner}>
                    <BlobCharacter
                      size={scale(32)}
                      color={currentSkin.bodyColor}
                      hatColor={currentSkin.hatColor}
                      hatBandColor={currentSkin.hatBand}
                      showSmoothie={false}
                    />
                  </View>
                </Animated.View>
                {blobTapCount > 0 && blobTapCount < 5 && (
                  <View style={styles.blobTapHint}>
                    <Text style={styles.blobTapHintText}>{5 - blobTapCount}x</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.topBarRight}>
              <TouchableOpacity
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Animated.sequence([
                    Animated.timing(coinScale, { toValue: 0.9, duration: 60, useNativeDriver: true }),
                    Animated.spring(coinScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
                  ]).start();
                  setShopVisible(true);
                }}
                activeOpacity={0.8}
                testID="coin-shop-button"
              >
                <Animated.View
                  style={[
                    styles.coinWidget,
                    {
                      opacity: pillsOpacity,
                      transform: [{ scale: coinScale }],
                    },
                  ]}
                >
                  <Coins size={moderateScale(15)} color="#D4920B" />
                  <Text style={styles.coinWidgetText}>{stats.coins}</Text>
                </Animated.View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShareScore}
                activeOpacity={0.8}
                testID="share-button"
              >
                <Animated.View
                  style={[
                    styles.shareWidget,
                    {
                      opacity: pillsOpacity,
                      transform: [{ scale: shareScale }],
                    },
                  ]}
                >
                  <CupSoda size={moderateScale(16)} color="#2D2D2D" />
                  <Text style={styles.shareWidgetText}>Share</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.content, { paddingBottom: groundOffset + safeBottom + verticalScale(40) }]}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: logoScale },
                    { rotate: logoSpin },
                  ],
                },
              ]}
            >
              <View style={styles.logoCloudBg}>
                <View style={styles.logoCloudL} />
                <View style={styles.logoCloudR} />
                <View style={styles.logoCloudCenter} />
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.logoBlob}>Blob</Text>
                <Text style={styles.logoDash}>Dash</Text>
              </View>
              <View style={styles.subtitleBar}>
                <View style={styles.subtitleLine} />
                <Text style={styles.logoSurvival}>SURVIVAL</Text>
                <View style={styles.subtitleLine} />
              </View>
              <Text style={styles.subtitle}>Dodge. Dash. Be a blob!</Text>
            </Animated.View>

            <Animated.View style={[styles.castRow, { opacity: castOpacity }]}>
              {mapFilteredSkins.map((blob) => {
                const isActive = stats.selectedSkin === blob.id;
                const isUnlocked = !blob.locked || stats.unlockedSkins.includes(blob.id);
                return (
                  <View key={blob.id} style={[styles.castBlobWrap, isActive && styles.castBlobActive]}>
                    {isActive && <View style={[styles.castBlobGlow, { backgroundColor: blob.bodyColor }]} />}
                    <View style={[
                      styles.castBlobCircle,
                      { borderColor: isActive ? blob.bodyColor : 'rgba(26,26,46,0.1)' },
                      isActive && styles.castBlobCircleActive,
                      !isUnlocked && styles.castBlobLocked,
                    ]}>
                      <BlobSkin skin={blob} size={scale(28)} animated={false} />
                    </View>
                    <Text style={[
                      styles.castBlobName,
                      isActive && { color: blob.bodyColor },
                    ]} numberOfLines={1}>{blob.name}</Text>
                    {isActive && <View style={[styles.castActiveDot, { backgroundColor: blob.bodyColor }]} />}
                  </View>
                );
              })}
            </Animated.View>

            <Animated.View
              style={[
                styles.cardsRow,
                {
                  opacity: cardsOpacity,
                  transform: [{ translateY: cardsY }],
                },
              ]}
            >
              <View style={styles.statCard}>
                <View style={styles.cardIconWrap}>
                  <Trophy size={moderateScale(24)} color="#D4920B" fill="#FFD84A" />
                </View>
                <Text style={styles.cardValue}>{stats.bestScore}</Text>
                <View style={styles.cardLabelBar}>
                  <Text style={styles.cardLabel}>BEST</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.cardIconWrap}>
                  <Ruler size={moderateScale(24)} color={GameColors.cardBorder} />
                </View>
                <Text style={styles.cardValue}>{formattedDistance}</Text>
                <View style={styles.cardLabelBar}>
                  <Text style={styles.cardLabel}>DISTANCE</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.cardIconWrap}>
                  <Star size={moderateScale(24)} color="#D4920B" fill="#FFD84A" />
                </View>
                <Text style={styles.cardValue}>{badgeCount}</Text>
                <View style={styles.cardLabelBar}>
                  <Text style={styles.cardLabel}>BADGES</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.mapSelectorWrap, { opacity: cardsOpacity, transform: [{ translateY: cardsY }, { scale: mapSwitchScale }] }]}>
              <View style={styles.mapSelectorHeader}>
                <View style={styles.mapSelectorTitleLine} />
                <Text style={styles.mapSelectorTitle}>SELECT MAP</Text>
                <View style={styles.mapSelectorTitleLine} />
              </View>
              <View style={styles.mapSelectorRow}>
                {selectableMaps.map((theme) => {
                  const isActive = stats.selectedMap === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.mapCard,
                        isActive && styles.mapCardActive,
                      ]}
                      onPress={() => handleMapSelect(theme.id)}
                      activeOpacity={0.75}
                      testID={`map-${theme.id}`}
                    >
                      {isActive && <View style={styles.mapCardGlow} />}
                      <View style={[styles.mapPreview, { backgroundColor: theme.preview.skyBottom }]}>
                        <View style={[styles.mapPreviewSkyTop, { backgroundColor: theme.preview.skyTop }]} />
                        <View style={[styles.mapPreviewGround, { backgroundColor: theme.preview.groundColor }]} />
                        <View style={[styles.mapPreviewAccent, { backgroundColor: theme.preview.accentColor }]} />
                        {theme.id === 'gotham' && (
                          <>
                            <View style={styles.gothamMoon} />
                            <View style={styles.gothamMoonGlow} />
                            <View style={styles.gothamBuilding1} />
                            <View style={styles.gothamBuilding2} />
                            <View style={styles.gothamBuilding3} />
                            <View style={styles.gothamBuilding4} />
                            <View style={styles.gothamBuilding5} />
                            <View style={[styles.gothamWindow, { top: 10, left: scale(10) }]} />
                            <View style={[styles.gothamWindow, { top: 16, left: scale(12) }]} />
                            <View style={[styles.gothamWindow, { top: 8, left: scale(30) }]} />
                            <View style={[styles.gothamWindow, { top: 14, left: scale(32) }]} />
                            <View style={[styles.gothamWindow, { top: 20, left: scale(30) }]} />
                            <View style={[styles.gothamWindow, { top: 6, right: scale(22) }]} />
                            <View style={[styles.gothamWindow, { top: 12, right: scale(20) }]} />
                            <View style={[styles.gothamWindow, { top: 18, right: scale(24) }]} />
                            <View style={[styles.gothamWindow, { top: 10, right: scale(8) }]} />
                            <View style={[styles.gothamWindow, { top: 16, right: scale(10) }]} />
                            <View style={styles.gothamBatSignal} />
                          </>
                        )}
                        {theme.id === 'park' && (
                          <>
                            <View style={styles.parkTree1} />
                            <View style={styles.parkTree2} />
                            <View style={styles.parkCloud} />
                          </>
                        )}
                        {isActive && <View style={styles.mapPreviewShine} />}
                      </View>
                      <View style={[styles.mapCardInfo, isActive && styles.mapCardInfoActive]}>
                        <View style={styles.mapCardInfoLeft}>
                          {theme.id === 'park' ? (
                            <TreePine size={moderateScale(15)} color={isActive ? '#5DA33A' : '#6B8E7B'} />
                          ) : (
                            <Text style={styles.mapCardIcon}>{theme.icon}</Text>
                          )}
                          <View>
                            <Text style={[
                              styles.mapCardName,
                              isActive && styles.mapCardNameActive,
                            ]}>{theme.name}</Text>
                            <Text style={[
                              styles.mapCardSubtitle,
                              isActive && styles.mapCardSubtitleActive,
                            ]}>{theme.subtitle}</Text>
                          </View>
                        </View>
                        {isActive && (
                          <View style={styles.mapActiveCheck}>
                            <Text style={styles.mapActiveCheckText}>✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            <Animated.View
              style={{
                transform: [
                  { scale: Animated.multiply(playScale, playBounce) },
                ],
              }}
            >
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlay}
                activeOpacity={0.8}
                testID="play-button"
              >
                <View style={styles.playButtonInner}>
                  <View style={styles.playButtonHighlight} />
                  <View style={styles.playTriangle}>
                    <Play size={moderateScale(26)} color={GameColors.uiWhite} fill={GameColors.uiWhite} />
                  </View>
                  <Text style={styles.playText}>PLAY</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View style={[styles.footer, { opacity: footerOpacity, bottom: footerBottom }]}>
            <TouchableOpacity
              style={styles.footerTouchable}
              onPress={() => {
                if (Platform.OS === 'web') {
                  scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.footerSwipe}>
                {Platform.OS === 'web' ? 'Tap to meet the crew' : 'Swipe to meet the crew'}
              </Text>
              <ChevronRight size={moderateScale(18)} color={GameColors.uiYellow} />
              <ChevronRight size={moderateScale(18)} color={GameColors.uiYellow} style={{ marginLeft: -10 }} />
            </TouchableOpacity>
          </Animated.View>

          <GroundWave />
        </View>

        <SkinSelector />
      </ScrollView>



      <View style={[styles.dotsRow, { bottom: dotsBottom }]}>
        <Animated.View style={[styles.dot, { backgroundColor: '#FFD84A', transform: [{ scale: dot0Scale }], opacity: dot0Opacity }]} />
        <Animated.View style={[styles.dot, { backgroundColor: '#FFD84A', transform: [{ scale: dot1Scale }], opacity: dot1Opacity }]} />
      </View>

      <ShopModal visible={shopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6DC8E8',
  },
  pager: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  skyGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#4DA8D0',
    opacity: 0.5,
  },
  skyGradientMid: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#90D6F0',
    opacity: 0.35,
  },
  blobTopLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobAvatarRing: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: 'rgba(255,216,74,0.3)',
    borderWidth: scale(2.5),
    borderColor: 'rgba(255,216,74,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4920B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  blobAvatarInner: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: scale(14),
    right: scale(8),
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(38),
  },
  logoCloudBg: {
    position: 'absolute',
    top: -20,
    left: -40,
    right: -40,
    bottom: -10,
    zIndex: -1,
  },
  logoCloudL: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: scale(80),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  logoCloudR: {
    position: 'absolute',
    right: 0,
    top: 15,
    width: scale(70),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  logoCloudCenter: {
    position: 'absolute',
    left: scale(30),
    top: 0,
    right: scale(30),
    bottom: 0,
    borderRadius: scale(35),
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoBlob: {
    fontSize: moderateScale(52),
    fontWeight: '900' as const,
    color: '#FF4422',
    textShadowColor: 'rgba(20,10,5,0.85)',
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 1,
    letterSpacing: -1,
    fontStyle: 'italic',
  },
  logoDash: {
    fontSize: moderateScale(52),
    fontWeight: '900' as const,
    color: '#FFC200',
    textShadowColor: 'rgba(20,10,5,0.85)',
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 1,
    letterSpacing: -1,
  },
  subtitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(-2),
  },
  subtitleLine: {
    width: scale(20),
    height: scale(2.5),
    backgroundColor: '#1A1A2E',
    borderRadius: 2,
    opacity: 0.3,
  },
  logoSurvival: {
    fontSize: moderateScale(22),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: scale(6),
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: '800' as const,
    color: '#D42B38',
    marginTop: verticalScale(6),
    fontStyle: 'italic',
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  castRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    marginBottom: verticalScale(12),
    marginTop: verticalScale(6),
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(9),
    borderRadius: scale(22),
    borderWidth: scale(2),
    borderColor: 'rgba(26,26,46,0.1)',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
  castBlobWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(2),
  },
  castBlobActive: {
    transform: [{ scale: 1.08 }],
  },
  castBlobGlow: {
    position: 'absolute',
    top: -scale(2),
    left: -scale(2),
    right: -scale(2),
    bottom: -scale(2),
    borderRadius: scale(22),
    opacity: 0.15,
  },
  castBlobCircle: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(1.8),
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  castBlobCircleActive: {
    borderWidth: scale(2.5),
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  castBlobLocked: {
    opacity: 0.35,
  },
  castBlobName: {
    fontSize: moderateScale(9),
    fontWeight: '800' as const,
    color: 'rgba(26,26,46,0.45)',
    marginTop: verticalScale(3),
    letterSpacing: 0.3,
    textAlign: 'center' as const,
  },
  castActiveDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    marginTop: verticalScale(3),
    borderWidth: 1.5,
    borderColor: '#1A1A2E',
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(20),
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: scale(6),
  },
  statCard: {
    flex: 1,
    maxWidth: scale(115),
    backgroundColor: '#FFFEF8',
    borderRadius: scale(20),
    paddingTop: verticalScale(14),
    paddingBottom: 0,
    alignItems: 'center',
    borderWidth: scale(2.5),
    borderColor: 'rgba(26,26,46,0.85)',
    shadowColor: 'rgba(10,10,20,0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  cardIconWrap: {
    marginBottom: verticalScale(4),
  },
  cardValue: {
    fontSize: moderateScale(22),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    marginBottom: verticalScale(8),
    textShadowColor: 'rgba(0,0,0,0.06)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardLabelBar: {
    width: '100%',
    backgroundColor: '#E88020',
    paddingVertical: verticalScale(6),
    alignItems: 'center',
    borderTopWidth: 2.5,
    borderTopColor: 'rgba(26,26,46,0.7)',
  },
  cardLabel: {
    fontSize: moderateScale(10),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  playButton: {
    shadowColor: '#2A7A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#55B020',
    paddingHorizontal: scale(48),
    paddingVertical: verticalScale(18),
    borderRadius: scale(32),
    gap: scale(10),
    borderWidth: scale(3),
    borderColor: 'rgba(26,26,46,0.85)',
    overflow: 'hidden',
    minWidth: wp(70),
    justifyContent: 'center',
  },
  playButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(180,240,120,0.4)',
    borderTopLeftRadius: scale(30),
    borderTopRightRadius: scale(30),
  },
  playTriangle: {
    marginRight: scale(2),
  },
  playText: {
    fontSize: moderateScale(30),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(10,40,0,0.7)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 1,
    letterSpacing: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  footerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  footerSwipe: {
    fontSize: moderateScale(13),
    fontWeight: '700' as const,
    color: 'rgba(255,216,74,0.9)',
    textShadowColor: 'rgba(26,26,46,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginRight: scale(4),
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(10),
    zIndex: 50,
  },
  dot: {
    width: scale(9),
    height: scale(9),
    borderRadius: scale(5),
    borderWidth: 2,
    borderColor: 'rgba(26,26,46,0.7)',
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  shareWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,210,50,0.95)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    borderRadius: scale(18),
    borderWidth: scale(2.5),
    borderColor: 'rgba(26,26,46,0.8)',
    gap: scale(5),
    shadowColor: 'rgba(180,120,0,0.4)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
    marginRight: scale(2),
  },

  shareWidgetText: {
    fontSize: moderateScale(13),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: 0.5,
  },
  topBarRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: scale(6),
  },
  coinWidget: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FFF8E0',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(7),
    borderRadius: scale(18),
    borderWidth: scale(2.5),
    borderColor: 'rgba(212,146,11,0.5)',
    gap: scale(4),
    shadowColor: 'rgba(180,120,0,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden' as const,
  },
  coinWidgetText: {
    fontSize: moderateScale(13),
    fontWeight: '900' as const,
    color: '#D4920B',
    letterSpacing: 0.3,
  },
  mapSelectorWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(6),
  },
  mapSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  mapSelectorTitle: {
    fontSize: moderateScale(11),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: 3,
    opacity: 0.5,
  },
  mapSelectorTitleLine: {
    width: scale(24),
    height: 2,
    backgroundColor: '#1A1A2E',
    opacity: 0.15,
    borderRadius: 1,
  },
  mapSelectorRow: {
    flexDirection: 'row',
    gap: scale(12),
    justifyContent: 'center',
    width: '100%',
  },
  mapCard: {
    flex: 1,
    maxWidth: scale(160),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    borderWidth: scale(2.5),
    borderColor: 'rgba(26,26,46,0.15)',
    overflow: 'hidden',
    shadowColor: 'rgba(10,10,20,0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  mapCardActive: {
    borderColor: 'rgba(255,200,0,0.9)',
    borderWidth: scale(3),
    shadowColor: 'rgba(200,140,0,0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#FFFDF0',
  },
  mapCardGlow: {
    position: 'absolute',
    top: -scale(4),
    left: -scale(4),
    right: -scale(4),
    bottom: -scale(4),
    borderRadius: scale(22),
    backgroundColor: 'rgba(255,216,74,0.12)',
    zIndex: -1,
  },
  mapPreview: {
    width: '100%',
    height: verticalScale(72),
    overflow: 'hidden',
  },
  mapPreviewShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  mapPreviewSkyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  mapPreviewGround: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  mapPreviewAccent: {
    position: 'absolute',
    bottom: '28%',
    left: 0,
    right: 0,
    height: 3,
  },
  gothamMoon: {
    position: 'absolute',
    top: verticalScale(5),
    right: scale(14),
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: '#FFE8A0',
    shadowColor: '#FFE8A0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 5,
  },
  gothamMoonGlow: {
    position: 'absolute',
    top: verticalScale(2),
    right: scale(10),
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: 'rgba(255,232,160,0.15)',
    zIndex: 4,
  },
  gothamBuilding1: {
    position: 'absolute',
    bottom: '28%',
    left: scale(4),
    width: scale(16),
    height: verticalScale(26),
    backgroundColor: '#12122A',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 3,
  },
  gothamBuilding2: {
    position: 'absolute',
    bottom: '28%',
    left: scale(22),
    width: scale(12),
    height: verticalScale(36),
    backgroundColor: '#0E0E22',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 3,
  },
  gothamBuilding3: {
    position: 'absolute',
    bottom: '28%',
    left: scale(36),
    width: scale(10),
    height: verticalScale(20),
    backgroundColor: '#16162E',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 3,
  },
  gothamBuilding4: {
    position: 'absolute',
    bottom: '28%',
    right: scale(16),
    width: scale(14),
    height: verticalScale(30),
    backgroundColor: '#101028',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 3,
  },
  gothamBuilding5: {
    position: 'absolute',
    bottom: '28%',
    right: scale(4),
    width: scale(10),
    height: verticalScale(22),
    backgroundColor: '#141430',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    zIndex: 3,
  },
  gothamBatSignal: {
    position: 'absolute',
    top: verticalScale(4),
    left: scale(16),
    width: scale(8),
    height: scale(5),
    borderRadius: scale(2),
    backgroundColor: 'rgba(255,216,74,0.25)',
    zIndex: 6,
  },
  gothamWindow: {
    position: 'absolute',
    width: scale(3),
    height: scale(3),
    borderRadius: 1,
    backgroundColor: '#FFD84A',
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 4,
  },
  parkTree1: {
    position: 'absolute',
    bottom: '28%',
    left: scale(15),
    width: scale(12),
    height: verticalScale(14),
    borderRadius: scale(6),
    backgroundColor: '#5DA33A',
  },
  parkTree2: {
    position: 'absolute',
    bottom: '28%',
    right: scale(20),
    width: scale(10),
    height: verticalScale(12),
    borderRadius: scale(5),
    backgroundColor: '#7EC850',
  },
  parkCloud: {
    position: 'absolute',
    top: verticalScale(6),
    left: scale(30),
    width: scale(20),
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  mapCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    borderTopWidth: 2,
    borderTopColor: 'rgba(26,26,46,0.06)',
  },
  mapCardInfoActive: {
    borderTopColor: 'rgba(255,216,74,0.3)',
    backgroundColor: 'rgba(255,216,74,0.06)',
  },
  mapCardInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  mapCardIcon: {
    fontSize: moderateScale(16),
  },
  mapCardName: {
    fontSize: moderateScale(11),
    fontWeight: '800' as const,
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
  mapCardNameActive: {
    color: '#B8860B',
  },
  mapCardSubtitle: {
    fontSize: moderateScale(8),
    fontWeight: '600' as const,
    color: '#1A1A2E',
    opacity: 0.35,
    marginTop: 1,
  },
  mapCardSubtitleActive: {
    color: '#D4920B',
    opacity: 0.6,
  },
  mapActiveCheck: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: '#6BBF36',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#1A1A2E',
    shadowColor: '#6BBF36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  mapActiveCheckText: {
    fontSize: moderateScale(11),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    marginTop: -1,
  },
  blobTapHint: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#FF6B4A',
    borderRadius: scale(8),
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(1),
    borderWidth: 1.5,
    borderColor: '#1A1A2E',
  },
  blobTapHintText: {
    fontSize: moderateScale(8),
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
});
