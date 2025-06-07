// Local storage utilities for offline caching

interface CacheData {
  data: any;
  timestamp: number;
  expiry: number;
}

class LocalCache {
  private readonly CACHE_PREFIX = 'thai2d_';
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    
    try {
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  get(key: string): any | null {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheData: CacheData = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > cacheData.expiry) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Check if data is fresh (within last 5 minutes)
  isFresh(key: string): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return false;

      const cacheData: CacheData = JSON.parse(cached);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      return cacheData.timestamp > fiveMinutesAgo && Date.now() < cacheData.expiry;
    } catch (error) {
      return false;
    }
  }
}

export const localCache = new LocalCache();

// Cache keys
export const CACHE_KEYS = {
  LIVE_RESULTS: 'live_results',
  TODAY_RESULTS: 'today_results',
  RECENT_HISTORY: 'recent_history',
  NUMBER_STATS: 'number_stats',
  POPULAR_NUMBERS: 'popular_numbers',
} as const;
