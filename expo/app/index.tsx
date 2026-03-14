import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Coins, Trophy, ShoppingBag, Lock, Check, Map } from 'lucide-react-native';
import { useGameState } from '@/providers/GameStateProvider';
import { BlobCharacter } from '@/components/BlobCharacter';
import { SKINS, getSkinById } from '@/constants/skins';
import { MAPS, getMapById } from '@/constants/maps';
import { GameColors } from '@/constants/colors';
import { scale, verticalScale, moderateScale } from '@/constants/layout';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { stats, selectSkin, unlockSkin, spendCoins, selectMap } = useGameState();

  const skin = useMemo(() => getSkinById(stats.selectedSkin), [stats.selectedSkin]);
  const currentMap = useMemo(() => getMapById(stats.selectedMap), [stats.selectedMap]);

  const [showSkins, setShowSkins] = useState<boolean>(false);
  const [showMaps, setShowMaps] = useState<boolean>(false);

  const titleScale = useRef(new Animated.Value(0)).current;
  const blobScale = useRef(new Animated.Value(0)).current;
  const buttonsY = useRef(new Animated.Value(60)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const playBounce = useRef(new Animated.Value(1)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(titleScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.spring(blobScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(buttonsY, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playBounce, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
        Animated.timing(playBounce, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    bounceLoop.start();

    return () => {
      bounceLoop.stop();
    };
  }, [titleScale, blobScale, buttonsY, buttonsOpacity, statsOpacity, playBounce]);

  const handlePlay = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/game');
  }, [router]);

  const handleSelectSkin = useCallback((skinId: string) => {
    const skinDef = getSkinById(skinId);
    if (stats.unlockedSkins.includes(skinId)) {
      selectSkin(skinId);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      if (stats.coins >= skinDef.price) {
        Alert.alert(
          `Unlock ${skinDef.name}?`,
          `This will cost ${skinDef.price} coins.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unlock',
              onPress: () => {
                const spent = spendCoins(skinDef.price);
                if (spent) {
                  unlockSkin(skinId);
                  selectSkin(skinId);
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Not Enough Coins', `You need ${skinDef.price - stats.coins} more coins.`);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }
  }, [stats, selectSkin, unlockSkin, spendCoins]);

  const handleSelectMap = useCallback((mapId: string) => {
    selectMap(mapId);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [selectMap]);

  const safeTop = Math.max(insets.top, 20);
  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.container, { backgroundColor: currentMap.skyTop }]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.skyGradient, { backgroundColor: currentMap.skyBottom }]} />

      <View style={[styles.groundStrip, { backgroundColor: currentMap.groundTop }]} />
      <View style={[styles.groundBase, { backgroundColor: currentMap.ground }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: safeTop + verticalScale(16), paddingBottom: safeBottom + verticalScale(20) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.coinPill}>
            <Coins size={moderateScale(15)} color="#D4920B" />
            <Text style={styles.coinText}>{stats.coins}</Text>
          </View>
          <View style={styles.highScorePill}>
            <Trophy size={moderateScale(13)} color="#B8860B" />
            <Text style={styles.highScoreText}>{stats.highScore}</Text>
          </View>
        </View>

        <Animated.View style={[styles.titleSection, { transform: [{ scale: titleScale }] }]}>
          <Text style={styles.title}>Gap Dash</Text>
          <Text style={styles.subtitle}>Tap to fly through the gaps!</Text>
        </Animated.View>

        <Animated.View style={[styles.blobSection, { transform: [{ scale: blobScale }] }]}>
          <View style={styles.blobShadow} />
          <BlobCharacter skin={skin} size={scale(110)} />
          <Text style={styles.skinName}>{skin.name}</Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity: statsOpacity }]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalRuns}</Text>
            <Text style={styles.statLabel}>Runs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.highScore}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonsSection, { opacity: buttonsOpacity, transform: [{ translateY: buttonsY }] }]}>
          <Animated.View style={{ transform: [{ scale: playBounce }] }}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.8} testID="play-button">
              <View style={styles.playButtonHighlight} />
              <Play size={moderateScale(26)} color="#FFF" fill="#FFF" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => { setShowSkins(!showSkins); setShowMaps(false); }}
              activeOpacity={0.7}
            >
              <ShoppingBag size={moderateScale(18)} color={GameColors.uiDark} />
              <Text style={styles.secondaryBtnText}>Skins</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => { setShowMaps(!showMaps); setShowSkins(false); }}
              activeOpacity={0.7}
            >
              <Map size={moderateScale(18)} color={GameColors.uiDark} />
              <Text style={styles.secondaryBtnText}>Maps</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showSkins && (
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Choose Your Character</Text>
            <View style={styles.skinGrid}>
              {SKINS.map((s) => {
                const isUnlocked = stats.unlockedSkins.includes(s.id);
                const isSelected = stats.selectedSkin === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.skinCard,
                      isSelected && styles.skinCardSelected,
                      !isUnlocked && styles.skinCardLocked,
                    ]}
                    onPress={() => handleSelectSkin(s.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.skinCheckBadge}>
                        <Check size={moderateScale(10)} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                    <View style={[styles.skinPreviewCircle, { backgroundColor: s.bodyColor + '30' }]}>
                      <BlobCharacter skin={s} size={scale(42)} />
                    </View>
                    <Text style={styles.skinCardName} numberOfLines={1}>{s.name}</Text>
                    {!isUnlocked && (
                      <View style={styles.skinPriceRow}>
                        <Lock size={moderateScale(9)} color="#B8860B" />
                        <Text style={styles.skinPriceText}>{s.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {showMaps && (
          <View style={styles.selectorSection}>
            <Text style={styles.selectorTitle}>Choose Your Map</Text>
            <View style={styles.mapGrid}>
              {MAPS.map((m) => {
                const isSelected = stats.selectedMap === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.mapCard, isSelected && styles.mapCardSelected]}
                    onPress={() => handleSelectMap(m.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.mapPreview, { backgroundColor: m.skyTop }]}>
                      <View style={[styles.mapPreviewGround, { backgroundColor: m.groundTop }]} />
                    </View>
                    <View style={styles.mapInfo}>
                      <Text style={styles.mapEmoji}>{m.emoji}</Text>
                      <Text style={styles.mapName}>{m.name}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.mapCheckBadge}>
                        <Check size={moderateScale(10)} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skyGradient: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  groundStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(60),
    zIndex: 1,
  },
  groundBase: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(40),
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(12),
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: scale(20),
    gap: scale(6),
    borderWidth: scale(2),
    borderColor: 'rgba(255,216,74,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinText: {
    fontSize: moderateScale(15),
    fontWeight: '900' as const,
    color: '#D4920B',
  },
  highScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: scale(20),
    gap: scale(6),
    borderWidth: scale(2),
    borderColor: 'rgba(184,134,11,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highScoreText: {
    fontSize: moderateScale(15),
    fontWeight: '900' as const,
    color: '#B8860B',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(42),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    marginTop: verticalScale(4),
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  blobSection: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  blobShadow: {
    position: 'absolute',
    bottom: verticalScale(8),
    width: scale(60),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  skinName: {
    fontSize: moderateScale(14),
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
    marginTop: verticalScale(8),
  },
  statsRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: verticalScale(24),
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    borderRadius: scale(16),
    alignItems: 'center',
    minWidth: scale(80),
    borderWidth: 1.5,
    borderColor: 'rgba(26,26,46,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: '900' as const,
    color: GameColors.uiDark,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600' as const,
    color: 'rgba(26,26,46,0.45)',
    marginTop: verticalScale(2),
  },
  buttonsSection: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(14),
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A8A4A',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(60),
    borderRadius: scale(24),
    gap: scale(12),
    overflow: 'hidden',
    shadowColor: '#1A6A30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  playButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  playButtonText: {
    fontSize: moderateScale(22),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(22),
    borderRadius: scale(18),
    gap: scale(8),
    borderWidth: 1.5,
    borderColor: 'rgba(26,26,46,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700' as const,
    color: GameColors.uiDark,
  },
  selectorSection: {
    width: '100%',
    marginTop: verticalScale(20),
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: scale(22),
    padding: scale(16),
    borderWidth: 1.5,
    borderColor: 'rgba(26,26,46,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800' as const,
    color: GameColors.uiDark,
    marginBottom: verticalScale(14),
    textAlign: 'center',
  },
  skinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: scale(10),
  },
  skinCard: {
    width: scale(76),
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(6),
    borderRadius: scale(16),
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skinCardSelected: {
    borderColor: '#2A8A4A',
    backgroundColor: 'rgba(42,138,74,0.08)',
  },
  skinCardLocked: {
    opacity: 0.65,
  },
  skinCheckBadge: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#2A8A4A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  skinPreviewCircle: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  skinCardName: {
    fontSize: moderateScale(10),
    fontWeight: '700' as const,
    color: GameColors.uiDark,
    textAlign: 'center',
  },
  skinPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    marginTop: verticalScale(2),
  },
  skinPriceText: {
    fontSize: moderateScale(9),
    fontWeight: '800' as const,
    color: '#B8860B',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: scale(10),
  },
  mapCard: {
    width: scale(150),
    borderRadius: scale(14),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  mapCardSelected: {
    borderColor: '#2A8A4A',
  },
  mapPreview: {
    height: verticalScale(50),
    position: 'relative',
  },
  mapPreviewGround: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    gap: scale(6),
  },
  mapEmoji: {
    fontSize: moderateScale(16),
  },
  mapName: {
    fontSize: moderateScale(12),
    fontWeight: '700' as const,
    color: GameColors.uiDark,
  },
  mapCheckBadge: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#2A8A4A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
});
