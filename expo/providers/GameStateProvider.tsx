import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface GameStats {
  coins: number;
  highScore: number;
  totalRuns: number;
  selectedSkin: string;
  selectedMap: string;
  unlockedSkins: string[];
}

const DEFAULT_STATS: GameStats = {
  coins: 0,
  highScore: 0,
  totalRuns: 0,
  selectedSkin: 'default',
  selectedMap: 'default',
  unlockedSkins: ['default'],
};

const STORAGE_KEY = 'gap_dash_stats';

export const [GameStateProvider, useGameState] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  const statsQuery = useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_STATS,
          coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
          highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
          totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
          selectedSkin: typeof parsed.selectedSkin === 'string' ? parsed.selectedSkin : 'default',
          selectedMap: typeof parsed.selectedMap === 'string' ? parsed.selectedMap : 'default',
          unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ['default'],
        } as GameStats;
      }
      return DEFAULT_STATS;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newStats: GameStats) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['gameStats'], data);
    },
  });

  useEffect(() => {
    if (statsQuery.data) {
      setStats(statsQuery.data);
    }
  }, [statsQuery.data]);

  const saveStats = useCallback((updated: GameStats) => {
    setStats(updated);
    saveMutation.mutate(updated);
  }, [saveMutation]);

  const addCoins = useCallback((amount: number) => {
    const updated = { ...stats, coins: stats.coins + amount };
    saveStats(updated);
    console.log(`[GameState] Added ${amount} coins. New balance: ${updated.coins}`);
  }, [stats, saveStats]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (stats.coins < amount) return false;
    const updated = { ...stats, coins: stats.coins - amount };
    saveStats(updated);
    console.log(`[GameState] Spent ${amount} coins. New balance: ${updated.coins}`);
    return true;
  }, [stats, saveStats]);

  const submitScore = useCallback((score: number, coinsEarned: number) => {
    const updated = {
      ...stats,
      coins: stats.coins + coinsEarned,
      highScore: Math.max(stats.highScore, score),
      totalRuns: stats.totalRuns + 1,
    };
    saveStats(updated);
    console.log(`[GameState] Run complete. Score: ${score}, Coins: +${coinsEarned}, High: ${updated.highScore}`);
  }, [stats, saveStats]);

  const selectSkin = useCallback((skinId: string) => {
    const updated = { ...stats, selectedSkin: skinId };
    saveStats(updated);
    console.log(`[GameState] Selected skin: ${skinId}`);
  }, [stats, saveStats]);

  const unlockSkin = useCallback((skinId: string) => {
    if (stats.unlockedSkins.includes(skinId)) return;
    const updated = { ...stats, unlockedSkins: [...stats.unlockedSkins, skinId] };
    saveStats(updated);
    console.log(`[GameState] Unlocked skin: ${skinId}`);
  }, [stats, saveStats]);

  const selectMap = useCallback((mapId: string) => {
    const updated = { ...stats, selectedMap: mapId };
    saveStats(updated);
    console.log(`[GameState] Selected map: ${mapId}`);
  }, [stats, saveStats]);

  return useMemo(() => ({
    stats,
    addCoins,
    spendCoins,
    submitScore,
    selectSkin,
    unlockSkin,
    selectMap,
    isLoading: statsQuery.isLoading,
  }), [stats, addCoins, spendCoins, submitScore, selectSkin, unlockSkin, selectMap, statsQuery.isLoading]);
});
