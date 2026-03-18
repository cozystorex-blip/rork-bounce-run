export interface CoinPack {
  id: string;
  coins: number;
  label: string;
  badge?: string;
  revenueCatProductId: string;
  priceLabel: string;
}

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'credits_100',
    coins: 100,
    label: 'Starter',
    revenueCatProductId: 'blobdash_credits_100',
    priceLabel: '$0.99',
  },
  {
    id: 'credits_500',
    coins: 500,
    label: 'Popular',
    badge: 'BEST VALUE',
    revenueCatProductId: 'blobdash_credits_500',
    priceLabel: '$3.99',
  },
  {
    id: 'credits_1200',
    coins: 1200,
    label: 'Big Bag',
    revenueCatProductId: 'blobdash_credits_1200',
    priceLabel: '$7.99',
  },
  {
    id: 'credits_2500',
    coins: 2500,
    label: 'Mega Vault',
    badge: 'BEST DEAL',
    revenueCatProductId: 'blobdash_credits_2500',
    priceLabel: '$14.99',
  },
];

export function getCoinPackById(id: string): CoinPack | undefined {
  return COIN_PACKS.find(p => p.id === id);
}

export function getCoinsForProduct(productId: string): number {
  const pack = COIN_PACKS.find(p => p.revenueCatProductId === productId);
  return pack?.coins ?? 0;
}
