import { 
  lotteryResults, 
  lotteryHistory, 
  numberStats,
  type LotteryResult, 
  type InsertLotteryResult,
  type LotteryHistory,
  type InsertLotteryHistory,
  type NumberStats,
  type InsertNumberStats
} from "@shared/schema";

export interface IStorage {
  // Lottery Results
  createLotteryResult(result: InsertLotteryResult): Promise<LotteryResult>;
  getLotteryResultsByDate(date: string): Promise<LotteryResult[]>;
  getLatestLotteryResult(): Promise<LotteryResult | undefined>;
  
  // History
  createLotteryHistory(history: InsertLotteryHistory): Promise<LotteryHistory>;
  getLotteryHistoryByDate(date: string): Promise<LotteryHistory | undefined>;
  getRecentLotteryHistory(days: number): Promise<LotteryHistory[]>;
  
  // Number Stats
  updateNumberStats(stats: InsertNumberStats): Promise<NumberStats>;
  getNumberStats(number: string): Promise<NumberStats | undefined>;
  getAllNumberStats(): Promise<NumberStats[]>;
  getMostFrequentNumbers(limit: number): Promise<NumberStats[]>;
}

export class MemStorage implements IStorage {
  private lotteryResults: Map<number, LotteryResult>;
  private lotteryHistory: Map<number, LotteryHistory>;
  private numberStats: Map<string, NumberStats>;
  private currentResultId: number;
  private currentHistoryId: number;
  private currentStatsId: number;

  constructor() {
    this.lotteryResults = new Map();
    this.lotteryHistory = new Map();
    this.numberStats = new Map();
    this.currentResultId = 1;
    this.currentHistoryId = 1;
    this.currentStatsId = 1;
  }

  async createLotteryResult(insertResult: InsertLotteryResult): Promise<LotteryResult> {
    const id = this.currentResultId++;
    const result: LotteryResult = { 
      ...insertResult, 
      id,
      createdAt: new Date()
    };
    this.lotteryResults.set(id, result);
    return result;
  }

  async getLotteryResultsByDate(date: string): Promise<LotteryResult[]> {
    return Array.from(this.lotteryResults.values()).filter(
      (result) => result.date === date
    );
  }

  async getLatestLotteryResult(): Promise<LotteryResult | undefined> {
    const results = Array.from(this.lotteryResults.values());
    return results.sort((a, b) => b.id - a.id)[0];
  }

  async createLotteryHistory(insertHistory: InsertLotteryHistory): Promise<LotteryHistory> {
    const id = this.currentHistoryId++;
    const history: LotteryHistory = { 
      ...insertHistory, 
      id,
      createdAt: new Date()
    };
    this.lotteryHistory.set(id, history);
    return history;
  }

  async getLotteryHistoryByDate(date: string): Promise<LotteryHistory | undefined> {
    return Array.from(this.lotteryHistory.values()).find(
      (history) => history.date === date
    );
  }

  async getRecentLotteryHistory(days: number): Promise<LotteryHistory[]> {
    const histories = Array.from(this.lotteryHistory.values());
    return histories
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  }

  async updateNumberStats(insertStats: InsertNumberStats): Promise<NumberStats> {
    const existing = Array.from(this.numberStats.values()).find(
      (stats) => stats.number === insertStats.number
    );

    if (existing) {
      const updated: NumberStats = { ...existing, ...insertStats };
      this.numberStats.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentStatsId++;
      const stats: NumberStats = { 
        ...insertStats, 
        id,
        occurrences: insertStats.occurrences || 0,
        frequency: insertStats.frequency || "0%"
      };
      this.numberStats.set(id, stats);
      return stats;
    }
  }

  async getNumberStats(number: string): Promise<NumberStats | undefined> {
    return Array.from(this.numberStats.values()).find(
      (stats) => stats.number === number
    );
  }

  async getAllNumberStats(): Promise<NumberStats[]> {
    return Array.from(this.numberStats.values());
  }

  async getMostFrequentNumbers(limit: number): Promise<NumberStats[]> {
    return Array.from(this.numberStats.values())
      .sort((a, b) => (b.occurrences || 0) - (a.occurrences || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
