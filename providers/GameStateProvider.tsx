import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { BADGES } from '@/constants/badges';
import { SKINS } from '@/constants/skins';
import { audioManager } from '@/utils/audio';

interface GameStats {
  bestScore: number;
  totalDistance: number;
  totalRuns: number;
  unlockedBadges: string[];
  selectedSkin: string;
  unlockedSkins: string[];
  musicEnabled: boolean;
  sfxEnabled: boolean;
  selectedMap: string;
  coins: number;
}

const DEFAULT_STATS: GameStats = {
  bestScore: 0,
  totalDistance: 0,
  totalRuns: 0,
  unlockedBadges: [],
  selectedSkin: 'hero',
  unlockedSkins: ['hero', 'shadow', 'tech'],
  musicEnabled: true,
  sfxEnabled: true,
  selectedMap: 'park',
  coins: 1,
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
          ...parsed,
          unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
          unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : DEFAULT_STATS.unlockedSkins,
          musicEnabled: parsed.musicEnabled ?? true,
          sfxEnabled: parsed.sfxEnabled ?? true,
          selectedMap: parsed.selectedMap ?? 'park',
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
      audioManager.setMusicEnabled(statsQuery.data.musicEnabled);
    }
  }, [statsQuery.data]);

  useEffect(() => {
    void audioManager.init().then(() => {
      void audioManager.loadPopSounds();
      void audioManager.loadMusic();
      void audioManager.loadScoreSound();
    });
  }, []);

  const checkBadges = useCallback((score: number, currentStats: GameStats): string[] => {
    const newBadges: string[] = [];
    for (const badge of BADGES) {
      if (currentStats.unlockedBadges.includes(badge.id)) continue;
      if (badge.type === 'gaps' && score >= badge.requirement) {
        newBadges.push(badge.id);
      }
      if (badge.type === 'score' && score >= badge.requirement) {
        newBadges.push(badge.id);
      }
      if (badge.type === 'runs' && (currentStats.totalRuns + 1) >= badge.requirement) {
        newBadges.push(badge.id);
      }
    }
    return newBadges;
  }, []);

  const submitRun = useCallback((score: number, distance: number) => {
    const newBadges = checkBadges(score, stats);
    const newUnlockedSkins = [...stats.unlockedSkins];
    for (const skin of SKINS) {
      if (!skin.locked) continue;
      if (newUnlockedSkins.includes(skin.id)) continue;
      if ((stats.totalRuns + 1) >= skin.unlockRequirement) {
        newUnlockedSkins.push(skin.id);
      }
    }
    let coinsEarned = 0;
    if (score >= 100) {
      coinsEarned = 3;
    } else if (score >= 50) {
      coinsEarned = 2;
    } else if (score >= 25) {
      coinsEarned = 1;
    }
    const updated: GameStats = {
      bestScore: Math.max(stats.bestScore, score),
      totalDistance: stats.totalDistance + distance,
      totalRuns: stats.totalRuns + 1,
      unlockedBadges: [...stats.unlockedBadges, ...newBadges],
      selectedSkin: stats.selectedSkin,
      unlockedSkins: newUnlockedSkins,
      musicEnabled: stats.musicEnabled,
      sfxEnabled: stats.sfxEnabled,
      selectedMap: stats.selectedMap,
      coins: stats.coins + coinsEarned,
    };
    setStats(updated);
    saveMutation.mutate(updated);
    return { newBadges, coinsEarned };
  }, [stats, checkBadges, saveMutation]);

  const purchaseSkin = useCallback((skinId: string): boolean => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    if (stats.unlockedSkins.includes(skinId)) return false;
    if (stats.coins < skin.price) return false;
    const updated: GameStats = {
      ...stats,
      coins: stats.coins - skin.price,
      unlockedSkins: [...stats.unlockedSkins, skinId],
      selectedSkin: skinId,
    };
    setStats(updated);
    saveMutation.mutate(updated);
    return true;
  }, [stats, saveMutation]);

  const unlockedBadgeObjects = useMemo(() => {
    return BADGES.filter(b => stats.unlockedBadges.includes(b.id));
  }, [stats.unlockedBadges]);

  const toggleMusic = useCallback(async () => {
    const enabled = await audioManager.toggleMusic();
    const updated = { ...stats, musicEnabled: enabled };
    setStats(updated);
    saveMutation.mutate(updated);
    return enabled;
  }, [stats, saveMutation]);

  const selectSkin = useCallback((skinId: string) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;
    if (skin.locked && !stats.unlockedSkins.includes(skinId)) return;
    const updated = { ...stats, selectedSkin: skinId };
    setStats(updated);
    saveMutation.mutate(updated);
  }, [stats, saveMutation]);

  const selectMap = useCallback((mapId: string) => {
    const updated = { ...stats, selectedMap: mapId };
    setStats(updated);
    saveMutation.mutate(updated);
  }, [stats, saveMutation]);

  const addCoins = useCallback((amount: number) => {
    const updated = { ...stats, coins: stats.coins + amount };
    setStats(updated);
    saveMutation.mutate(updated);
    console.log(`[GameState] Added ${amount} coins. New balance: ${updated.coins}`);
  }, [stats, saveMutation]);

  const spendCoins = useCallback((amount: number): boolean => {
    if (stats.coins < amount) {
      console.log(`[GameState] Cannot spend ${amount} coins. Balance: ${stats.coins}`);
      return false;
    }
    const updated = { ...stats, coins: stats.coins - amount };
    setStats(updated);
    saveMutation.mutate(updated);
    console.log(`[GameState] Spent ${amount} coins. New balance: ${updated.coins}`);
    return true;
  }, [stats, saveMutation]);

  const canAfford = useCallback((amount: number): boolean => {
    return stats.coins >= amount;
  }, [stats.coins]);

  const getBalance = useCallback((): number => {
    return stats.coins;
  }, [stats.coins]);

  const currentSkin = useMemo(() => {
    return SKINS.find(s => s.id === stats.selectedSkin) ?? SKINS[0];
  }, [stats.selectedSkin]);

  return useMemo(() => ({
    stats,
    submitRun,
    selectSkin,
    selectMap,
    purchaseSkin,
    addCoins,
    spendCoins,
    canAfford,
    getBalance,
    currentSkin,
    toggleMusic,
    unlockedBadges: unlockedBadgeObjects,
    badgeCount: stats.unlockedBadges.length,
    totalBadges: BADGES.length,
    isLoading: statsQuery.isLoading,
  }), [stats, submitRun, selectSkin, selectMap, purchaseSkin, addCoins, spendCoins, canAfford, getBalance, currentSkin, toggleMusic, unlockedBadgeObjects, statsQuery.isLoading]);
});

export function useFormattedDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}
