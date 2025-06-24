import { apiRequest } from "./queryClient";

export interface LiveResult {
  set: string;
  value: string;
  time: string;
  twod: string;
}

export interface TodayResult {
  set: string;
  value: string;
  open_time: string;
  twod: string;
}

export interface NumberStats {
  number: string;
  occurrences: number;
  frequency: string;
  lastSeen: string | null;
}

export interface HistoryData {
  date: string;
  results: any;
}

export const lotteryApi = {
  // Fetch live results
  async getLiveResults(): Promise<any> {
    const response = await apiRequest("GET", "/api/lottery/live");
    return response.json();
  },

  // Fetch today's results
  async getTodayResults(): Promise<any> {
    const response = await apiRequest("GET", "/api/lottery/results");
    return response.json();
  },

  // Fetch history for specific date
  async getHistoryByDate(date: string): Promise<any> {
    const response = await apiRequest("GET", `/api/lottery/history/${date}`);
    return response.json();
  },

  // Fetch recent history
  async getRecentHistory(days: number = 10): Promise<HistoryData[]> {
    const response = await apiRequest("GET", `/api/lottery/recent-history/${days}`);
    return response.json();
  },

  // Fetch number statistics
  async getNumberStats(number: string): Promise<NumberStats> {
    const response = await apiRequest("GET", `/api/lottery/stats/${number}`);
    return response.json();
  },

  // Fetch popular numbers
  async getPopularNumbers(limit: number = 10): Promise<NumberStats[]> {
    const response = await apiRequest("GET", `/api/lottery/popular-numbers?limit=${limit}`);
    return response.json();
  },

  // Fetch all statistics
  async getAllStats(): Promise<NumberStats[]> {
    const response = await apiRequest("GET", "/api/lottery/all-stats");
    return response.json();
  },
};
