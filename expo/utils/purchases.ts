import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const CREDITS_PER_PURCHASE = 100;
const OFFERING_ID = 'credits_store';
const PACKAGE_ID = 'credits_100';

function getRCApiKey(): string {
  if (Platform.OS === 'web') {
    console.log('[Purchases] Web platform - purchases not supported');
    return '';
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: '',
  }) as string;
}

export function isPurchaseAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  const apiKey = getRCApiKey();
  return apiKey.length > 0;
}

let isConfigured = false;

export function configureRevenueCat() {
  if (isConfigured) return;
  if (Platform.OS === 'web') {
    console.log('[Purchases] Skipping RevenueCat on web');
    return;
  }
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

export async function fetchCreditsOffering() {
  if (!isConfigured) {
    console.warn('[Purchases] Not configured, cannot fetch offerings');
    return null;
  }
  try {
    const offerings = await Purchases.getOfferings();
    console.log('[Purchases] Offerings fetched. Current:', offerings.current?.identifier, 'All keys:', Object.keys(offerings.all));
    const offering = offerings.current ?? offerings.all[OFFERING_ID];
    if (!offering) {
      console.warn('[Purchases] No credits offering found. Available:', Object.keys(offerings.all));
      return null;
    }
    const pkg = offering.availablePackages.find(p => p.identifier === PACKAGE_ID)
      ?? offering.availablePackages[0];
    if (!pkg) {
      console.warn('[Purchases] No package found in offering. Available:', offering.availablePackages.map(p => p.identifier));
      return null;
    }
    console.log('[Purchases] Package found:', pkg.identifier, 'Product:', pkg.product.identifier);
    return pkg;
  } catch (e) {
    console.error('[Purchases] Error fetching offerings:', e);
    return null;
  }
}

export async function purchaseCredits(): Promise<{ success: boolean; credits: number }> {
  if (!isConfigured) {
    console.warn('[Purchases] Not configured, cannot purchase');
    return { success: false, credits: 0 };
  }
  try {
    const pkg = await fetchCreditsOffering();
    if (!pkg) {
      return { success: false, credits: 0 };
    }
    console.log('[Purchases] Purchasing package:', pkg.identifier, 'Product:', pkg.product.identifier);
    const result = await Purchases.purchasePackage(pkg);
    console.log('[Purchases] Purchase success. Active entitlements:', JSON.stringify(result.customerInfo.entitlements.active));
    return { success: true, credits: CREDITS_PER_PURCHASE };
  } catch (e: any) {
    if (e?.userCancelled) {
      console.log('[Purchases] User cancelled purchase');
    } else if (e?.code === '1' || e?.message?.includes('cancelled')) {
      console.log('[Purchases] User cancelled purchase (iOS)');
    } else if (e?.code === '6' || e?.message?.includes('receipt')) {
      console.error('[Purchases] Receipt validation error (iOS):', e?.message);
    } else {
      console.error('[Purchases] Purchase error:', JSON.stringify(e, null, 2));
    }
    return { success: false, credits: 0 };
  }
}

export async function restorePurchases() {
  if (!isConfigured) {
    console.warn('[Purchases] Not configured, cannot restore');
    return null;
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('[Purchases] Restored purchases. Active entitlements:', JSON.stringify(customerInfo.entitlements.active));
    return customerInfo;
  } catch (e) {
    console.error('[Purchases] Restore error:', e);
    return null;
  }
}

export { CREDITS_PER_PURCHASE };
