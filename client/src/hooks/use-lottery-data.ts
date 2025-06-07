import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { lotteryApi } from "@/lib/lottery-api";
import { localCache, CACHE_KEYS } from "@/lib/storage";

export function useLotteryData() {
  const queryClient = useQueryClient();

  // Live results query
  const liveQuery = useQuery({
    queryKey: ["/api/lottery/live"],
    queryFn: async () => {
      try {
        const data = await lotteryApi.getLiveResults();
        localCache.set(CACHE_KEYS.LIVE_RESULTS, data);
        return data;
      } catch (error) {
        // Try to use cached data if API fails
        const cached = localCache.get(CACHE_KEYS.LIVE_RESULTS);
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  // Today's results query
  const todayQuery = useQuery({
    queryKey: ["/api/lottery/results"],
    queryFn: async () => {
      try {
        const data = await lotteryApi.getTodayResults();
        localCache.set(CACHE_KEYS.TODAY_RESULTS, data);
        return data;
      } catch (error) {
        const cached = localCache.get(CACHE_KEYS.TODAY_RESULTS);
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });

  // Recent history query
  const historyQuery = useQuery({
    queryKey: ["/api/lottery/recent-history"],
    queryFn: async () => {
      try {
        const data = await lotteryApi.getRecentHistory(10);
        localCache.set(CACHE_KEYS.RECENT_HISTORY, data);
        return data;
      } catch (error) {
        const cached = localCache.get(CACHE_KEYS.RECENT_HISTORY);
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });

  // Popular numbers query
  const popularQuery = useQuery({
    queryKey: ["/api/lottery/popular-numbers"],
    queryFn: async () => {
      try {
        const data = await lotteryApi.getPopularNumbers(8);
        localCache.set(CACHE_KEYS.POPULAR_NUMBERS, data);
        return data;
      } catch (error) {
        const cached = localCache.get(CACHE_KEYS.POPULAR_NUMBERS);
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refetch if we're online
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ["/api/lottery/live"] });
        queryClient.invalidateQueries({ queryKey: ["/api/lottery/results"] });
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [queryClient]);

  // Calculate quick stats
  const quickStats = {
    mostFrequent: popularQuery.data?.[0]?.number || "--",
    streak: Math.floor(Math.random() * 10) + 1, // Mock streak calculation
  };

  return {
    liveResult: liveQuery.data,
    todayResults: todayQuery.data,
    recentHistory: historyQuery.data,
    popularNumbers: popularQuery.data,
    numberStats: null, // Will be set when searching
    quickStats,
    isLoading: liveQuery.isLoading || todayQuery.isLoading,
    error: liveQuery.error || todayQuery.error || historyQuery.error,
  };
}
