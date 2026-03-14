import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { COIN_PACKS, getCoinsForProduct } from '@/constants/coinPacks';

function getRCApiKey(): string {
  if (Platform.OS === 'web') {
    return '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: '',
  }) as string;
}

export function isPurchaseAvailable(): boolean {
  const apiKey = getRCApiKey();
  return apiKey.length > 0;
}

let isConfigured = false;

export function configureRevenueCat() {
  if (isConfigured) return;
  const apiKey = getRCApiKey();
  if (!apiKey) {
    console.warn('[Purchases] No RevenueCat API key found. Platform:', Platform.OS, '__DEV__:', __DEV__);
    return;
  }
  try {
    if (__DEV__) {
      void Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    } else {
      void Purchases.setLogLevel(LOG_LEVEL.INFO);
    }
    Purchases.configure({ apiKey });
    isConfigured = true;
    console.log('[Purchases] RevenueCat configured. Platform:', Platform.OS, 'isDev:', __DEV__, 'keyPrefix:', apiKey.substring(0, 8) + '...');
  } catch (e) {
    console.error('[Purchases] Failed to configure RevenueCat:', e);
    isConfigured = false;
  }
}

export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}

export interface CoinPackOffering {
  packId: string;
  coins: number;
  label: string;
  badge?: string;
  priceLabel: string;
  rcPackage: PurchasesPackage | null;
}

export async function fetchCoinPackOfferings(): Promise<CoinPackOffering[]> {
  const result: CoinPackOffering[] = COIN_PACKS.map(pack => ({
    packId: pack.id,
    coins: pack.coins,
    label: pack.label,
    badge: pack.badge,
    priceLabel: pack.priceLabel,
    rcPackage: null,
  }));

  if (!isConfigured) {
    console.warn('[Purchases] Not configured, returning default coin packs without RC packages');
    return result;
  }

  try {
    const offerings = await Purchases.getOfferings();
    console.log('[Purchases] Offerings fetched. Current:', offerings.current?.identifier, 'All keys:', Object.keys(offerings.all));

    const offering = offerings.current ?? offerings.all['coin_store'];
    if (!offering) {
      console.warn('[Purchases] No coin_store offering found. Available:', Object.keys(offerings.all));
      return result;
    }

    for (const rcPkg of offering.availablePackages) {
      const productId = rcPkg.product.identifier;
      const matchIdx = result.findIndex(r => r.packId === productId || COIN_PACKS.find(p => p.id === r.packId)?.revenueCatProductId === productId);
      if (matchIdx >= 0) {
        result[matchIdx].rcPackage = rcPkg;
        result[matchIdx].priceLabel = rcPkg.product.priceString ?? result[matchIdx].priceLabel;
        console.log('[Purchases] Matched package:', productId, '→', result[matchIdx].packId);
      }
    }
  } catch (e) {
    console.error('[Purchases] Error fetching offerings:', e);
  }

  return result;
}

export interface PurchaseResult {
  success: boolean;
  coins: number;
  productId?: string;
  transactionId?: string;
}

const processedTransactions = new Set<string>();

export async function purchaseCoinPack(offering: CoinPackOffering): Promise<PurchaseResult> {
  if (!isConfigured) {
    console.warn('[Purchases] Not configured, cannot purchase');
    return { success: false, coins: 0 };
  }

  if (!offering.rcPackage) {
    console.warn('[Purchases] No RC package for this coin pack:', offering.packId);
    return { success: false, coins: 0 };
  }

  try {
    console.log('[Purchases] Purchasing package:', offering.rcPackage.identifier, 'Product:', offering.rcPackage.product.identifier);
    const result = await Purchases.purchasePackage(offering.rcPackage);

    const txId = result.customerInfo.originalAppUserId + '_' + Date.now().toString();
    if (processedTransactions.has(txId)) {
      console.warn('[Purchases] Duplicate transaction detected:', txId);
      return { success: false, coins: 0 };
    }
    processedTransactions.add(txId);

    const productId = offering.rcPackage.product.identifier;
    const coins = getCoinsForProduct(productId) || offering.coins;

    console.log('[Purchases] Purchase success. Coins:', coins, 'Product:', productId);
    return { success: true, coins, productId, transactionId: txId };
  } catch (e: any) {
    if (e?.userCancelled) {
      console.log('[Purchases] User cancelled purchase');
    } else if (e?.code === '1' || e?.message?.includes('cancelled')) {
      console.log('[Purchases] User cancelled purchase (iOS)');
    } else if (e?.code === '6' || e?.message?.includes('receipt')) {
      console.error('[Purchases] Receipt validation error:', e?.message);
    } else {
      console.error('[Purchases] Purchase error:', JSON.stringify(e, null, 2));
    }
    return { success: false, coins: 0 };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; message: string }> {
  if (!isConfigured) {
    console.warn('[Purchases] Not configured, cannot restore');
    return { success: false, message: 'Purchases not available on this platform.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('[Purchases] Restored purchases. Active entitlements:', JSON.stringify(customerInfo.entitlements.active));
    const activeCount = Object.keys(customerInfo.entitlements.active).length;
    if (activeCount > 0) {
      return { success: true, message: `Restored ${activeCount} purchase(s).` };
    }
    return { success: true, message: 'No previous purchases found.' };
  } catch (e) {
    console.error('[Purchases] Restore error:', e);
    return { success: false, message: 'Failed to restore purchases. Please try again.' };
  }
}
