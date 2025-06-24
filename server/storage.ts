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
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async createLotteryResult(insertResult: InsertLotteryResult): Promise<LotteryResult> {
    const [result] = await db
      .insert(lotteryResults)
      .values(insertResult)
      .returning();
    return result;
  }

  async getLotteryResultsByDate(date: string): Promise<LotteryResult[]> {
    return await db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.date, date));
  }

  async getLatestLotteryResult(): Promise<LotteryResult | undefined> {
    const [result] = await db
      .select()
      .from(lotteryResults)
      .orderBy(desc(lotteryResults.id))
      .limit(1);
    return result || undefined;
  }

  async createLotteryHistory(insertHistory: InsertLotteryHistory): Promise<LotteryHistory> {
    const [history] = await db
      .insert(lotteryHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async getLotteryHistoryByDate(date: string): Promise<LotteryHistory | undefined> {
    const [history] = await db
      .select()
      .from(lotteryHistory)
      .where(eq(lotteryHistory.date, date));
    return history || undefined;
  }

  async getRecentLotteryHistory(days: number): Promise<LotteryHistory[]> {
    return await db
      .select()
      .from(lotteryHistory)
      .orderBy(desc(lotteryHistory.date))
      .limit(days);
  }

  async updateNumberStats(insertStats: InsertNumberStats): Promise<NumberStats> {
    const [existing] = await db
      .select()
      .from(numberStats)
      .where(eq(numberStats.number, insertStats.number!));

    if (existing) {
      const [updated] = await db
        .update(numberStats)
        .set(insertStats)
        .where(eq(numberStats.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(numberStats)
        .values(insertStats)
        .returning();
      return created;
    }
  }

  async getNumberStats(number: string): Promise<NumberStats | undefined> {
    const [stats] = await db
      .select()
      .from(numberStats)
      .where(eq(numberStats.number, number));
    return stats || undefined;
  }

  async getAllNumberStats(): Promise<NumberStats[]> {
    return await db.select().from(numberStats);
  }

  async getMostFrequentNumbers(limit: number): Promise<NumberStats[]> {
    return await db
      .select()
      .from(numberStats)
      .orderBy(desc(numberStats.occurrences))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
