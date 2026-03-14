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
    id: 'coins_100',
    coins: 100,
    label: 'Starter',
    revenueCatProductId: 'coins_100',
    priceLabel: '$0.99',
  },
  {
    id: 'coins_500',
    coins: 500,
    label: 'Popular',
    badge: 'BEST VALUE',
    revenueCatProductId: 'coins_500',
    priceLabel: '$3.99',
  },
  {
    id: 'coins_1200',
    coins: 1200,
    label: 'Big Bag',
    revenueCatProductId: 'coins_1200',
    priceLabel: '$7.99',
  },
  {
    id: 'coins_2500',
    coins: 2500,
    label: 'Mega Vault',
    badge: 'BEST DEAL',
    revenueCatProductId: 'coins_2500',
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
