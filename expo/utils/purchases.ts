import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { COIN_PACKS, getCoinsForProduct } from '@/constants/coinPacks';

const PROCESSED_TX_KEY = 'blobdash_processed_transactions';
const OFFERING_ID = 'credits_store';

function getRCApiKey(): string {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '',
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

async function loadProcessedTransactions(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(PROCESSED_TX_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      return new Set(arr);
    }
  } catch (e) {
    console.error('[Purchases] Failed to load processed transactions:', e);
  }
  return new Set();
}

async function saveProcessedTransaction(txId: string): Promise<void> {
  try {
    const existing = await loadProcessedTransactions();
    existing.add(txId);
    const arr = Array.from(existing);
    const trimmed = arr.length > 500 ? arr.slice(arr.length - 500) : arr;
    await AsyncStorage.setItem(PROCESSED_TX_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('[Purchases] Failed to save processed transaction:', e);
  }
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

    const offering = offerings.current ?? offerings.all[OFFERING_ID];
    if (!offering) {
      console.warn('[Purchases] No offering found. Looked for current or "' + OFFERING_ID + '". Available:', Object.keys(offerings.all));
      return result;
    }

    console.log('[Purchases] Using offering:', offering.identifier, 'Packages:', offering.availablePackages.length);

    for (const rcPkg of offering.availablePackages) {
      const productId = rcPkg.product.identifier;
      const matchIdx = result.findIndex(r => {
        const pack = COIN_PACKS.find(p => p.id === r.packId);
        return pack?.revenueCatProductId === productId;
      });
      if (matchIdx >= 0) {
        result[matchIdx].rcPackage = rcPkg;
        result[matchIdx].priceLabel = rcPkg.product.priceString ?? result[matchIdx].priceLabel;
        console.log('[Purchases] Matched package:', productId, '→', result[matchIdx].packId, 'price:', result[matchIdx].priceLabel);
      } else {
        console.warn('[Purchases] Unmatched RC package product:', productId);
      }
    }

    const matched = result.filter(r => r.rcPackage !== null).length;
    console.log('[Purchases] Matched', matched, '/', result.length, 'coin packs to RC packages');
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
    const purchaseResult = await Purchases.purchasePackage(offering.rcPackage);

    const allTxIds = purchaseResult.customerInfo.nonSubscriptionTransactions;
    const productId = offering.rcPackage.product.identifier;

    let txId = '';
    if (allTxIds && allTxIds.length > 0) {
      const relevantTx = allTxIds
        .filter(tx => tx.productIdentifier === productId)
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      if (relevantTx.length > 0) {
        txId = relevantTx[0].transactionIdentifier;
      }
    }

    if (!txId) {
      txId = purchaseResult.customerInfo.originalAppUserId + '_' + productId + '_' + Date.now().toString();
      console.log('[Purchases] No transaction ID found in response, using fallback:', txId);
    }

    const processedTxs = await loadProcessedTransactions();
    if (processedTxs.has(txId)) {
      console.warn('[Purchases] Duplicate transaction detected:', txId);
      return { success: false, coins: 0 };
    }

    await saveProcessedTransaction(txId);

    const coins = getCoinsForProduct(productId) || offering.coins;
    console.log('[Purchases] Purchase success. Coins:', coins, 'Product:', productId, 'TxId:', txId);
    return { success: true, coins, productId, transactionId: txId };
  } catch (e: any) {
    if (e?.userCancelled) {
      console.log('[Purchases] User cancelled purchase');
    } else if (e?.code === 1 || e?.code === '1') {
      console.log('[Purchases] User cancelled purchase (code 1)');
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
    console.log('[Purchases] Non-subscription transactions:', customerInfo.nonSubscriptionTransactions?.length ?? 0);

    const activeCount = Object.keys(customerInfo.entitlements.active).length;
    const txCount = customerInfo.nonSubscriptionTransactions?.length ?? 0;

    if (activeCount > 0 || txCount > 0) {
      return {
        success: true,
        message: activeCount > 0
          ? `Restored ${activeCount} active entitlement(s).`
          : `Found ${txCount} previous transaction(s). Consumable coin purchases cannot be re-granted after use.`,
      };
    }
    return { success: true, message: 'No previous purchases found.' };
  } catch (e) {
    console.error('[Purchases] Restore error:', e);
    return { success: false, message: 'Failed to restore purchases. Please try again.' };
  }
}
