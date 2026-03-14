import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Coins, Plus, RotateCcw, ShieldCheck, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { useGameState } from '@/providers/GameStateProvider';
import { purchaseCredits, restorePurchases, CREDITS_PER_PURCHASE, isPurchaseAvailable } from '@/utils/purchases';
import { scale, verticalScale, moderateScale } from '@/constants/layout';

export default function PurchaseScreen() {
  const insets = useSafeAreaInsets();
  const { stats, addCoins } = useGameState();
  const canPurchase = isPurchaseAvailable();

  const headerScale = useRef(new Animated.Value(0)).current;
  const balanceY = useRef(new Animated.Value(30)).current;
  const balanceOpacity = useRef(new Animated.Value(0)).current;
  const buttonsY = useRef(new Animated.Value(40)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const coinPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(balanceY, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(balanceOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(buttonsY, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(coinPulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(coinPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [headerScale, balanceY, balanceOpacity, buttonsY, buttonsOpacity, coinPulse]);

  const buyMutation = useMutation({
    mutationFn: purchaseCredits,
    onSuccess: (result) => {
      if (result.success) {
        addCoins(result.credits);
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Purchase Complete!', `You received ${result.credits} coins!`);
        console.log('[Purchases] Credits purchased successfully:', result.credits);
      }
    },
    onError: (error) => {
      console.error('[Purchases] Purchase failed:', error);
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

  const handleBuy = useCallback(() => {
    if (!canPurchase) {
      Alert.alert('Purchases Unavailable', 'In-app purchases are not available on this platform.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buyMutation.mutate();
  }, [buyMutation, canPurchase]);

  const handleRestore = useCallback(() => {
    if (!canPurchase) {
      Alert.alert('Purchases Unavailable', 'In-app purchases are not available on this platform.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restoreMutation.mutate();
  }, [restoreMutation, canPurchase]);

  const safeTop = Math.max(insets.top, 20);
  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <View style={styles.bgAccent} />

      <View style={[styles.inner, { paddingTop: safeTop + verticalScale(24), paddingBottom: safeBottom }]}>
        <Animated.View style={[styles.headerSection, { transform: [{ scale: headerScale }] }]}>
          <View style={styles.iconCircle}>
            <CreditCard size={moderateScale(32)} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Store</Text>
          <Text style={styles.subtitle}>Purchase coins for your account</Text>
        </Animated.View>

        <Animated.View style={[styles.balanceCard, { opacity: balanceOpacity, transform: [{ translateY: balanceY }] }]}>
          <View style={styles.balanceRow}>
            <Animated.View style={[styles.coinIconWrap, { transform: [{ scale: coinPulse }] }]}>
              <Coins size={moderateScale(28)} color="#D4920B" />
            </Animated.View>
            <View style={styles.balanceTextWrap}>
              <Text style={styles.balanceAmount}>{stats.coins}</Text>
              <Text style={styles.balanceLabel}>coins available</Text>
            </View>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceFooter}>
            <ShieldCheck size={moderateScale(14)} color="#6BBF36" />
            <Text style={styles.balanceFooterText}>Secured by RevenueCat</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.actionsSection, { opacity: buttonsOpacity, transform: [{ translateY: buttonsY }] }]}>
          <TouchableOpacity
            style={[styles.buyButton, !canPurchase && styles.buyButtonDisabled]}
            onPress={handleBuy}
            activeOpacity={0.8}
            disabled={buyMutation.isPending}
            testID="buy-credits-button"
          >
            <View style={styles.buyButtonHighlight} />
            {buyMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Plus size={moderateScale(22)} color="#FFF" strokeWidth={3} />
                <View style={styles.buyTextWrap}>
                  <Text style={styles.buyButtonTitle}>Buy {CREDITS_PER_PURCHASE} Coins</Text>
                  <Text style={styles.buyButtonPrice}>$0.99</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.restoreButton, !canPurchase && styles.restoreButtonDisabled]}
            onPress={handleRestore}
            activeOpacity={0.7}
            disabled={restoreMutation.isPending}
            testID="restore-purchases-button"
          >
            {restoreMutation.isPending ? (
              <ActivityIndicator size="small" color="#8A8A9E" />
            ) : (
              <>
                <RotateCcw size={moderateScale(16)} color="#8A8A9E" />
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {!canPurchase && (
          <View style={styles.unavailableBanner}>
            <Text style={styles.unavailableText}>
              In-app purchases are only available on iOS and Android devices.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1123',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#161836',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: '#0F1123',
  },
  bgAccent: {
    position: 'absolute',
    top: '20%',
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,216,74,0.04)',
  },
  inner: {
    flex: 1,
    paddingHorizontal: scale(24),
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  iconCircle: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: 'rgba(255,216,74,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,216,74,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(15),
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
  },
  balanceCard: {
    width: '100%',
    backgroundColor: '#1C1E3A',
    borderRadius: scale(24),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'rgba(255,216,74,0.12)',
    marginBottom: verticalScale(28),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  coinIconWrap: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: 'rgba(255,216,74,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTextWrap: {
    flex: 1,
  },
  balanceAmount: {
    fontSize: moderateScale(36),
    fontWeight: '900' as const,
    color: '#FFD84A',
    letterSpacing: -1,
  },
  balanceLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: verticalScale(14),
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  balanceFooterText: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.35)',
  },
  actionsSection: {
    width: '100%',
    gap: verticalScale(14),
    alignItems: 'center',
  },
  buyButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A8A4A',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(24),
    borderRadius: scale(20),
    gap: scale(12),
    overflow: 'hidden',
    shadowColor: '#1A6A30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buyButtonDisabled: {
    backgroundColor: '#2A2C4A',
    shadowOpacity: 0,
    elevation: 0,
  },
  buyButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
  },
  buyTextWrap: {
    alignItems: 'flex-start',
  },
  buyButtonTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buyButtonPrice: {
    fontSize: moderateScale(13),
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(24),
    borderRadius: scale(16),
    gap: scale(8),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  restoreButtonDisabled: {
    opacity: 0.4,
  },
  restoreText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: '#8A8A9E',
  },
  unavailableBanner: {
    marginTop: verticalScale(24),
    backgroundColor: 'rgba(255,160,60,0.1)',
    borderRadius: scale(14),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: 'rgba(255,160,60,0.15)',
  },
  unavailableText: {
    fontSize: moderateScale(13),
    fontWeight: '500' as const,
    color: 'rgba(255,180,80,0.7)',
    textAlign: 'center' as const,
    lineHeight: moderateScale(18),
  },
});
