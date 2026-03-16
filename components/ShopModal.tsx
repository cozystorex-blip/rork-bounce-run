import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Coins, ShoppingBag, RotateCcw, Sparkles, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { COIN_PACKS } from '@/constants/coinPacks';
import {
  fetchCoinPackOfferings,
  purchaseCoinPack,
  restorePurchases,
  isPurchaseAvailable,
  CoinPackOffering,
} from '@/utils/purchases';
import { useGameState } from '@/providers/GameStateProvider';
import { scale, verticalScale, moderateScale } from '@/constants/layout';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShopModal({ visible, onClose }: ShopModalProps) {
  const insets = useSafeAreaInsets();
  const { stats, addCoins } = useGameState();
  const [offerings, setOfferings] = useState<CoinPackOffering[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const coinBounce = useRef(new Animated.Value(1)).current;

  const purchaseAvailable = isPurchaseAvailable();

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }).start();

      const packs: CoinPackOffering[] = COIN_PACKS.map(pack => ({
        packId: pack.id,
        coins: pack.coins,
        label: pack.label,
        badge: pack.badge,
        priceLabel: pack.priceLabel,
        rcPackage: null,
      }));
      setOfferings(packs);

      if (purchaseAvailable) {
        fetchCoinPackOfferings()
          .then(result => {
            setOfferings(result);
            console.log('[Shop] Loaded offerings:', result.length);
          })
          .catch(e => console.error('[Shop] Failed to load offerings:', e));
      }
    }
  }, [visible, slideAnim, purchaseAvailable]);

  const handlePurchase = useCallback(async (offering: CoinPackOffering) => {
    if (purchasingId) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasingId(offering.packId);

    if (!purchaseAvailable || !offering.rcPackage) {
      Alert.alert('Not Available', 'This purchase is not available right now. Please try again later.');
      setPurchasingId(null);
      return;
    }

    try {
      const result = await purchaseCoinPack(offering);
      if (result.success && result.coins > 0) {
        addCoins(result.coins);
        setSuccessId(offering.packId);
        Animated.sequence([
          Animated.timing(coinBounce, { toValue: 1.3, duration: 150, useNativeDriver: true }),
          Animated.spring(coinBounce, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
        ]).start();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => setSuccessId(null), 1500);
        console.log('[Shop] Purchase success:', result.coins, 'coins');
      }
    } catch (e) {
      console.error('[Shop] Purchase failed:', e);
    } finally {
      setPurchasingId(null);
    }
  }, [purchasingId, purchaseAvailable, addCoins, coinBounce]);

  const restoreMutation = useMutation({
    mutationFn: restorePurchases,
    onSuccess: (result) => {
      void Haptics.notificationAsync(
        result.success
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
      Alert.alert(
        result.success ? 'Restored' : 'Restore',
        result.message
      );
    },
    onError: () => {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    },
  });

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose]);

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const modalOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayBg} onPress={handleClose} activeOpacity={1} />

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 20),
              transform: [{ translateY: modalTranslateY }],
              opacity: modalOpacity,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ShoppingBag size={moderateScale(20)} color="#1A1A2E" />
              <Text style={styles.headerTitle}>Coin Shop</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              testID="shop-close"
            >
              <X size={moderateScale(18)} color="#1A1A2E" />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.balanceRow, { transform: [{ scale: coinBounce }] }]}>
            <View style={styles.balancePill}>
              <Coins size={moderateScale(18)} color="#D4920B" />
              <Text style={styles.balanceText}>{stats.coins}</Text>
              <Text style={styles.balanceLabel}>coins</Text>
            </View>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.packsContainer}
            bounces={true}
          >
            {offerings.map((offering) => {
              const isPurchasing = purchasingId === offering.packId;
              const isSuccess = successId === offering.packId;

              return (
                <TouchableOpacity
                  key={offering.packId}
                  style={[
                    styles.packCard,
                    offering.badge && styles.packCardFeatured,
                    isSuccess && styles.packCardSuccess,
                  ]}
                  onPress={() => handlePurchase(offering)}
                  disabled={!!purchasingId}
                  activeOpacity={0.8}
                  testID={`buy-${offering.packId}`}
                >
                  {offering.badge && (
                    <View style={styles.packBadge}>
                      <Sparkles size={moderateScale(10)} color="#FFFFFF" />
                      <Text style={styles.packBadgeText}>{offering.badge}</Text>
                    </View>
                  )}

                  <View style={styles.packLeft}>
                    <View style={styles.packCoinIcon}>
                      <Coins size={moderateScale(22)} color="#D4920B" />
                    </View>
                    <View>
                      <Text style={styles.packCoins}>{offering.coins.toLocaleString()}</Text>
                      <Text style={styles.packLabel}>{offering.label}</Text>
                    </View>
                  </View>

                  <View style={[
                    styles.packBuyBtn,
                    offering.badge && styles.packBuyBtnFeatured,
                    isSuccess && styles.packBuyBtnSuccess,
                  ]}>
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : isSuccess ? (
                      <Check size={moderateScale(16)} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.packBuyText}>{offering.priceLabel}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              restoreMutation.mutate();
            }}
            disabled={restoreMutation.isPending || !purchaseAvailable}
            activeOpacity={0.7}
            testID="restore-purchases"
          >
            {restoreMutation.isPending ? (
              <ActivityIndicator size="small" color="#888" />
            ) : (
              <>
                <RotateCcw size={moderateScale(14)} color="#888" />
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,25,0.55)',
  },
  sheet: {
    backgroundColor: '#FEFBF4',
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    paddingTop: verticalScale(8),
    paddingHorizontal: scale(20),
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: scale(40),
    height: scale(4),
    backgroundColor: 'rgba(26,26,46,0.15)',
    borderRadius: scale(2),
    alignSelf: 'center',
    marginBottom: verticalScale(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: '900' as const,
    color: '#1A1A2E',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: 'rgba(26,26,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#FFF8E0',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    borderRadius: scale(20),
    borderWidth: scale(2),
    borderColor: 'rgba(212,146,11,0.25)',
    shadowColor: 'rgba(212,146,11,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceText: {
    fontSize: moderateScale(24),
    fontWeight: '900' as const,
    color: '#D4920B',
  },
  balanceLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700' as const,
    color: 'rgba(212,146,11,0.6)',
    marginLeft: scale(2),
  },
  packsContainer: {
    gap: verticalScale(10),
    paddingBottom: verticalScale(8),
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderWidth: scale(2),
    borderColor: 'rgba(26,26,46,0.1)',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'visible',
  },
  packCardFeatured: {
    borderColor: 'rgba(255,200,0,0.5)',
    backgroundColor: '#FFFDF0',
    shadowColor: 'rgba(200,150,0,0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  packCardSuccess: {
    borderColor: 'rgba(85,176,32,0.5)',
    backgroundColor: '#F5FFF0',
  },
  packBadge: {
    position: 'absolute',
    top: -verticalScale(10),
    right: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    backgroundColor: '#E88020',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: scale(8),
    borderWidth: 1.5,
    borderColor: 'rgba(26,26,46,0.6)',
    zIndex: 5,
  },
  packBadgeText: {
    fontSize: moderateScale(8),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  packLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  packCoinIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#FFF8E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(1.5),
    borderColor: 'rgba(212,146,11,0.2)',
  },
  packCoins: {
    fontSize: moderateScale(20),
    fontWeight: '900' as const,
    color: '#1A1A2E',
  },
  packLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700' as const,
    color: 'rgba(26,26,46,0.4)',
    marginTop: 1,
  },
  packBuyBtn: {
    backgroundColor: '#55B020',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    borderRadius: scale(14),
    borderWidth: scale(2.5),
    borderColor: 'rgba(26,26,46,0.7)',
    minWidth: scale(80),
    alignItems: 'center',
    shadowColor: '#2A7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  packBuyBtnFeatured: {
    backgroundColor: '#E88020',
    shadowColor: '#B05A00',
  },
  packBuyBtnSuccess: {
    backgroundColor: '#55B020',
  },
  packBuyText: {
    fontSize: moderateScale(14),
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(4),
  },
  restoreText: {
    fontSize: moderateScale(13),
    fontWeight: '600' as const,
    color: '#888',
  },
});
