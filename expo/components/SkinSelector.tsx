import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Lock, Check, Star, Coins, Plus, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { SKINS, SkinData, DEFAULT_MOVEMENT } from '@/constants/skins';
import { useGameState } from '@/providers/GameStateProvider';
import { MAP_THEMES } from '@/constants/maps';
import { purchaseCredits, restorePurchases, CREDITS_PER_PURCHASE, isPurchaseAvailable } from '@/utils/purchases';
import BlobSkin from '@/components/BlobSkin';
import CloudBackground from '@/components/CloudBackground';
import GroundWave from '@/components/GroundWave';
import { SCREEN, scale, verticalScale, moderateScale } from '@/constants/layout';

const SCREEN_WIDTH = SCREEN.width;

const FlapPreview = React.memo(function FlapPreview({ skinId, trigger }: { skinId: string; trigger: number }) {
  const skin = React.useMemo(() => SKINS.find(s => s.id === skinId), [skinId]);
  const mp = skin?.movement ?? DEFAULT_MOVEMENT;
  const bounceY = useRef(new Animated.Value(0)).current;
  const squashScaleX = useRef(new Animated.Value(1)).current;
  const squashScaleY = useRef(new Animated.Value(1)).current;
  const wobbleRot = useRef(new Animated.Value(0)).current;
  const horizontalShift = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    bounceY.setValue(0);
    squashScaleX.setValue(1);
    squashScaleY.setValue(1);
    wobbleRot.setValue(0);
    horizontalShift.setValue(0);
    tiltAnim.setValue(0);

    const riseHeight = -14 - mp.flapForceMultiplier * 16;
    const riseDuration = Math.round(70 + (1 - mp.flapForceMultiplier) * 140);
    const fallDuration = Math.round(250 + (1 - mp.gravityMultiplier) * 250);

    const anims: Animated.CompositeAnimation[] = [
      Animated.sequence([
        Animated.timing(bounceY, { toValue: riseHeight, duration: riseDuration, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 2, duration: fallDuration, useNativeDriver: true }),
        Animated.timing(bounceY, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(squashScaleX, { toValue: mp.flapSquashX, duration: mp.flapSquashDuration, useNativeDriver: true }),
        Animated.spring(squashScaleX, { toValue: 1, friction: mp.flapSpringFriction, tension: mp.flapSpringTension, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(squashScaleY, { toValue: mp.flapSquashY, duration: mp.flapSquashDuration, useNativeDriver: true }),
        Animated.spring(squashScaleY, { toValue: 1, friction: mp.flapSpringFriction, tension: mp.flapSpringTension, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(tiltAnim, { toValue: -1, duration: riseDuration * 0.6, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 0.4, duration: fallDuration * 0.5, useNativeDriver: true }),
        Animated.timing(tiltAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
    ];

    if (mp.wobbleAmount > 0) {
      anims.push(Animated.sequence([
        Animated.timing(wobbleRot, { toValue: 1, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
        Animated.timing(wobbleRot, { toValue: -0.7, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
        Animated.timing(wobbleRot, { toValue: 0.3, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
        Animated.timing(wobbleRot, { toValue: 0, duration: mp.wobbleDuration * 0.25, useNativeDriver: true }),
      ]));
    }

    if (mp.riseSmoothing < 0.9) {
      const jitterStrength = (1.0 - mp.riseSmoothing) * 12;
      anims.push(Animated.sequence([
        Animated.timing(horizontalShift, { toValue: jitterStrength, duration: 80, useNativeDriver: true }),
        Animated.timing(horizontalShift, { toValue: -jitterStrength * 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(horizontalShift, { toValue: jitterStrength * 0.3, duration: 80, useNativeDriver: true }),
        Animated.timing(horizontalShift, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]));
    }

    Animated.parallel(anims).start();
  }, [trigger, bounceY, squashScaleX, squashScaleY, wobbleRot, horizontalShift, tiltAnim, mp]);

  const wobbleDeg = wobbleRot.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`-${mp.wobbleAmount * 3}deg`, '0deg', `${mp.wobbleAmount * 3}deg`],
  });

  const tiltDeg = tiltAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '10deg'],
  });

  return (
    <Animated.View style={{
      transform: [
        { translateX: horizontalShift },
        { translateY: bounceY },
        { scaleX: squashScaleX },
        { scaleY: squashScaleY },
        { rotate: wobbleDeg },
        { rotate: tiltDeg },
      ],
    }}>
      {skin && <BlobSkin skin={skin} size={SCREEN_WIDTH * 0.16} animated={false} />}
    </Animated.View>
  );
});

export default React.memo(function SkinSelector() {
  const { stats, selectSkin, purchaseSkin, addCoins } = useGameState();
  const filteredSkins = React.useMemo(() => SKINS.filter(s => s.mapAffinity === stats.selectedMap), [stats.selectedMap]);
  const currentMapTheme = React.useMemo(() => MAP_THEMES.find(m => m.id === stats.selectedMap), [stats.selectedMap]);
  const bannerScale = useRef(new Animated.Value(0)).current;
  const skinsOpacity = useRef(new Animated.Value(0)).current;
  const skinsY = useRef(new Animated.Value(40)).current;
  const standShine = useRef(new Animated.Value(0)).current;
  const [previewTriggers, setPreviewTriggers] = React.useState<Record<string, number>>({});

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bannerScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(skinsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(skinsY, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(standShine, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(standShine, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [bannerScale, skinsOpacity, skinsY, standShine]);

  const buyMutation = useMutation({
    mutationFn: purchaseCredits,
    onSuccess: (result) => {
      if (result.success) {
        addCoins(result.credits);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Purchase Complete!', `You received ${result.credits} coins!`);
        console.log('[SkinSelector] Credits purchased successfully:', result.credits);
      }
    },
    onError: (error) => {
      console.error('[SkinSelector] Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restorePurchases,
    onSuccess: (result) => {
      if (result) {
        Alert.alert('Restore Complete', 'Your purchases have been restored.');
      } else {
        Alert.alert('Nothing to Restore', 'No previous purchases found.');
      }
    },
    onError: () => {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    },
  });

  const canPurchase = isPurchaseAvailable();

  const handleBuyCredits = useCallback(() => {
    if (!canPurchase) {
      Alert.alert('Purchases Unavailable', 'In-app purchases are not available right now. Please check your configuration.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buyMutation.mutate();
  }, [buyMutation, canPurchase]);

  const handleRestore = useCallback(() => {
    restoreMutation.mutate();
  }, [restoreMutation]);

  const handleSelect = useCallback((skin: SkinData) => {
    const isLocked = skin.locked && !stats.unlockedSkins.includes(skin.id);

    if (isLocked) {
      if (stats.coins >= skin.price) {
        Alert.alert(
          `Unlock ${skin.name}?`,
          `Spend ${skin.price} coins to unlock ${skin.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unlock',
              onPress: () => {
                const success = purchaseSkin(skin.id);
                if (success) {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setPreviewTriggers(prev => ({ ...prev, [skin.id]: (prev[skin.id] ?? 0) + 1 }));
                  console.log('[SkinSelector] Unlocked skin:', skin.id);
                }
              },
            },
          ]
        );
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Not Enough Coins', `You need ${skin.price - stats.coins} more coins to unlock ${skin.name}.`);
      }
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    selectSkin(skin.id);
    setPreviewTriggers(prev => ({ ...prev, [skin.id]: (prev[skin.id] ?? 0) + 1 }));
  }, [stats.unlockedSkins, stats.coins, selectSkin, purchaseSkin]);

  const shineOpacity = standShine.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.35, 0.1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.skyGradientTop} />
      <View style={styles.skyGradientMid} />
      <CloudBackground />

      <View style={styles.content}>
        <Animated.View style={[styles.bannerWrap, { transform: [{ scale: bannerScale }] }]}>
          <View style={styles.banner}>
            <View style={styles.bannerRibbonL} />
            <View style={styles.bannerRibbonR} />
            <View style={styles.bannerStars}>
              <Star size={moderateScale(14)} color="#FFD84A" fill="#FFD84A" />
              <Text style={styles.bannerText}>{currentMapTheme?.name?.toUpperCase() ?? 'BLOB SHOP'}</Text>
              <Star size={moderateScale(14)} color="#FFD84A" fill="#FFD84A" />
            </View>
            <Text style={styles.bannerSub}>{currentMapTheme?.icon} Pick your fighter!</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.shopStand,
            {
              opacity: skinsOpacity,
              transform: [{ translateY: skinsY }],
            },
          ]}
        >
          <View style={styles.standAwning}>
            <View style={styles.awningStripe1} />
            <View style={styles.awningStripe2} />
            <View style={styles.awningStripe3} />
            <View style={styles.awningStripe4} />
            <View style={styles.awningStripe5} />
            <View style={styles.awningEdge} />
          </View>

          <View style={styles.standBody}>
            <Animated.View style={[styles.standShine, { opacity: shineOpacity }]} />

            <View style={styles.standShelf}>
              <View style={styles.shelfRow}>
                {filteredSkins.map((skin) => {
                  const isSelected = stats.selectedSkin === skin.id;
                  const isLocked = skin.locked && !stats.unlockedSkins.includes(skin.id);
                  const isFree = skin.price === 0;

                  return (
                    <TouchableOpacity
                      key={skin.id}
                      style={[
                        styles.shopSlot,
                        isSelected && styles.shopSlotSelected,
                      ]}
                      onPress={() => handleSelect(skin)}
                      activeOpacity={isLocked ? 0.5 : 0.7}
                      testID={`skin-${skin.id}`}
                    >
                      <View style={[styles.blobDisplay, isLocked && styles.blobLocked]}>
                        {isSelected && !isLocked ? (
                          <FlapPreview skinId={skin.id} trigger={previewTriggers[skin.id] ?? 0} />
                        ) : (
                          <BlobSkin skin={skin} size={SCREEN_WIDTH * 0.16} animated={false} />
                        )}
                        {isLocked && (
                          <View style={styles.lockOverlay}>
                            <Lock size={moderateScale(16)} color="#FFD84A" />
                          </View>
                        )}
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Check size={moderateScale(10)} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>

                      <Text style={[
                        styles.slotName,
                        isSelected && styles.slotNameSelected,
                      ]} numberOfLines={1}>
                        {skin.name}
                      </Text>

                      <View style={[
                        styles.priceTag,
                        isSelected && styles.priceTagSelected,
                        isFree && !isLocked && styles.priceTagFree,
                        isLocked && stats.coins >= skin.price && styles.priceTagCanBuy,
                      ]}>
                        {isLocked ? (
                          <View style={styles.priceRow}>
                            <Coins size={moderateScale(10)} color={stats.coins >= skin.price ? '#FFD84A' : '#888'} />
                            <Text style={[
                              styles.priceText,
                              stats.coins < skin.price && styles.priceTextInsufficient,
                            ]}>{skin.price}</Text>
                          </View>
                        ) : (
                          <Text style={styles.priceTextOwned}>OWNED</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.standCounter} />
          </View>

          {stats.selectedSkin && (
            <View style={styles.selectedSpeechWrap}>
              <Text style={styles.selectedSpeechText}>
                {SKINS.find(s => s.id === stats.selectedSkin)?.speechLine ?? ''}
              </Text>
              <View style={styles.selectedSpeechTail} />
            </View>
          )}

          <View style={styles.standLegs}>
            <View style={styles.standLeg} />
            <View style={styles.standLeg} />
          </View>
        </Animated.View>

        <View style={styles.coinBalanceCard}>
          <View style={styles.coinBalanceIconWrap}>
            <Coins size={moderateScale(16)} color="#D4920B" />
          </View>
          <View style={styles.coinBalanceTextWrap}>
            <Text style={styles.coinBalanceValue}>{stats.coins}</Text>
            <Text style={styles.coinBalanceLabel}>coins available</Text>
          </View>
          {canPurchase && (
            <TouchableOpacity
              style={styles.buyButton}
              onPress={handleBuyCredits}
              activeOpacity={0.7}
              disabled={buyMutation.isPending}
              testID="buy-credits-button"
            >
              {buyMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Plus size={moderateScale(14)} color="#FFF" strokeWidth={3} />
                  <Text style={styles.buyButtonText}>{CREDITS_PER_PURCHASE} for $0.99</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {canPurchase && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            activeOpacity={0.7}
            disabled={restoreMutation.isPending}
            testID="restore-purchases-button"
          >
            <RotateCcw size={moderateScale(12)} color="#888" />
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Star size={moderateScale(14)} color="#D4920B" fill="#FFD84A" />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoText}>
              {stats.unlockedSkins.length}/{SKINS.length} blobs collected
            </Text>
            <Text style={styles.infoSubtext}>Play as Shady or Bubbles & score 8+ to earn coins!</Text>
          </View>
        </View>
      </View>

      <GroundWave />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7EC8E3',
    width: SCREEN_WIDTH,
  },
  skyGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#5AADCF',
    opacity: 0.5,
  },
  skyGradientMid: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#96D4E8',
    opacity: 0.35,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(140),
    paddingHorizontal: scale(12),
  },
  bannerWrap: {
    marginBottom: verticalScale(16),
  },
  banner: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    borderWidth: scale(3),
    borderColor: '#1A1A2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'visible',
    alignItems: 'center',
  },
  bannerRibbonL: {
    position: 'absolute',
    left: scale(-12),
    top: verticalScale(8),
    width: scale(14),
    height: verticalScale(30),
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: scale(4),
    borderBottomLeftRadius: scale(4),
    transform: [{ skewY: '-5deg' }],
  },
  bannerRibbonR: {
    position: 'absolute',
    right: scale(-12),
    top: verticalScale(8),
    width: scale(14),
    height: verticalScale(30),
    backgroundColor: '#1A1A2E',
    borderTopRightRadius: scale(4),
    borderBottomRightRadius: scale(4),
    transform: [{ skewY: '5deg' }],
  },
  bannerStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  bannerText: {
    fontSize: moderateScale(20),
    fontWeight: '900' as const,
    color: '#FFD84A',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  bannerSub: {
    fontSize: moderateScale(10),
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.65)',
    marginTop: verticalScale(2),
    letterSpacing: 1,
  },
  shopStand: {
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  standAwning: {
    width: '95%',
    height: verticalScale(28),
    flexDirection: 'row',
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
    overflow: 'hidden',
    borderWidth: scale(2.5),
    borderBottomWidth: 0,
    borderColor: '#1A1A2E',
  },
  awningStripe1: {
    flex: 1,
    backgroundColor: '#FF6B4A',
  },
  awningStripe2: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  awningStripe3: {
    flex: 1,
    backgroundColor: '#FF6B4A',
  },
  awningStripe4: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  awningStripe5: {
    flex: 1,
    backgroundColor: '#FF6B4A',
  },
  awningEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(4),
    backgroundColor: '#D44A2E',
  },
  standBody: {
    width: '95%',
    backgroundColor: '#FFFCF0',
    borderWidth: scale(2.5),
    borderColor: '#1A1A2E',
    borderTopWidth: 0,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(8),
    paddingHorizontal: scale(8),
    overflow: 'hidden',
  },
  standShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD84A',
  },
  standShelf: {
    zIndex: 2,
    paddingVertical: verticalScale(4),
  },
  shelfRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: scale(4),
  },
  shelfDivider: {
    height: 1,
    backgroundColor: 'rgba(26,26,46,0.1)',
    marginHorizontal: scale(10),
    marginVertical: verticalScale(6),
  },
  standCounter: {
    height: verticalScale(8),
    backgroundColor: '#E8C870',
    borderRadius: scale(4),
    marginTop: verticalScale(6),
    borderWidth: scale(2),
    borderColor: '#1A1A2E',
    zIndex: 1,
  },
  standLegs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingHorizontal: scale(20),
  },
  standLeg: {
    width: scale(8),
    height: verticalScale(14),
    backgroundColor: '#C4A055',
    borderWidth: scale(2),
    borderTopWidth: 0,
    borderColor: '#1A1A2E',
    borderBottomLeftRadius: scale(3),
    borderBottomRightRadius: scale(3),
  },
  shopSlot: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.27,
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(4),
  },
  shopSlotSelected: {
    backgroundColor: 'rgba(255,216,74,0.25)',
    borderRadius: scale(16),
    shadowColor: '#FFD84A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  blobDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_WIDTH * 0.17,
    marginBottom: verticalScale(4),
  },
  blobLocked: {
    opacity: 0.45,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: scale(30),
  },
  selectedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: '#6BBF36',
    borderWidth: scale(2.5),
    borderColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6BBF36',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  priceTag: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    borderRadius: scale(10),
    borderWidth: scale(1.5),
    borderColor: '#1A1A2E',
    minWidth: scale(50),
    alignItems: 'center',
  },
  priceTagSelected: {
    backgroundColor: '#7DC83F',
    borderColor: '#5DA33A',
  },
  priceTagFree: {
    backgroundColor: '#7DC83F',
    borderColor: '#5DA33A',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
  },
  priceText: {
    fontSize: moderateScale(9),
    fontWeight: '900' as const,
    color: '#FFD84A',
    letterSpacing: 0.5,
  },
  priceTextInsufficient: {
    color: '#888',
  },
  priceTagCanBuy: {
    backgroundColor: '#D4920B',
    borderColor: '#A07020',
  },
  priceTextOwned: {
    fontSize: moderateScale(8),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  slotName: {
    fontSize: moderateScale(11),
    fontWeight: '800' as const,
    color: '#1A1A2E',
    marginBottom: verticalScale(3),
    textAlign: 'center',
  },
  slotNameSelected: {
    color: '#D4920B',
    fontWeight: '900' as const,
  },
  selectedSpeechWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(14),
    borderWidth: scale(2.5),
    borderColor: '#1A1A2E',
    marginTop: verticalScale(10),
    alignSelf: 'center',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  selectedSpeechText: {
    fontSize: moderateScale(12),
    fontWeight: '800' as const,
    color: '#1A1A2E',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  selectedSpeechTail: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1A1A2E',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: scale(14),
    borderWidth: 2.5,
    borderColor: '#FFBDCF',
    marginBottom: verticalScale(10),
    gap: scale(10),
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  noteIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#FFE0E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFBDCF',
  },
  noteText: {
    flex: 1,
    fontSize: moderateScale(12),
    fontWeight: '800' as const,
    color: '#C44569',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
    borderWidth: 2.5,
    borderColor: '#1A1A2E',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: scale(10),
  },
  infoIconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: '#FFF3D4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8C870',
  },
  infoTextWrap: {
    flex: 1,
  },
  infoText: {
    fontSize: moderateScale(13),
    fontWeight: '900' as const,
    color: '#1A1A2E',
  },
  infoSubtext: {
    fontSize: moderateScale(10),
    fontWeight: '700' as const,
    color: '#666',
    marginTop: verticalScale(1),
    fontStyle: 'italic',
  },
  coinBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
    borderRadius: scale(18),
    borderWidth: 2.5,
    borderColor: '#E8C870',
    marginBottom: verticalScale(10),
    gap: scale(10),
    shadowColor: '#D4920B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  coinBalanceIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#FFE8A8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8C870',
  },
  coinBalanceTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: scale(6),
  },
  coinBalanceValue: {
    fontSize: moderateScale(20),
    fontWeight: '900' as const,
    color: '#D4920B',
  },
  coinBalanceLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700' as const,
    color: '#A08040',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6BBF36',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(14),
    borderWidth: scale(2),
    borderColor: '#5DA33A',
    gap: scale(5),
    minWidth: scale(95),
    justifyContent: 'center',
    shadowColor: '#3A8A10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    fontSize: moderateScale(10),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingVertical: verticalScale(6),
    marginBottom: verticalScale(10),
  },
  restoreText: {
    fontSize: moderateScale(10),
    fontWeight: '700' as const,
    color: '#888',
  },
});
