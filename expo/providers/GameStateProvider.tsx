import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface GameStats {
  coins: number;
}

const DEFAULT_STATS: GameStats = {
  coins: 0,
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

  const addCoins = useCallback((amount: number) => {
    const updated = { ...stats, coins: stats.coins + amount };
    setStats(updated);
    saveMutation.mutate(updated);
    console.log(`[GameState] Added ${amount} coins. New balance: ${updated.coins}`);
  }, [stats, saveMutation]);

  return useMemo(() => ({
    stats,
    addCoins,
    isLoading: statsQuery.isLoading,
  }), [stats, addCoins, statsQuery.isLoading]);
});
