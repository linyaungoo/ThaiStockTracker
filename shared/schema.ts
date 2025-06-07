import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lotteryResults = pgTable("lottery_results", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  set: text("set").notNull(),
  value: text("value").notNull(),
  twod: text("twod").notNull(),
  openTime: text("open_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lotteryHistory = pgTable("lottery_history", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const numberStats = pgTable("number_stats", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  occurrences: integer("occurrences").default(0),
  lastSeen: timestamp("last_seen"),
  frequency: text("frequency").default("0%"),
});

export const insertLotteryResultSchema = createInsertSchema(lotteryResults).omit({
  id: true,
  createdAt: true,
});

export const insertLotteryHistorySchema = createInsertSchema(lotteryHistory).omit({
  id: true,
  createdAt: true,
});

export const insertNumberStatsSchema = createInsertSchema(numberStats).omit({
  id: true,
});

export type InsertLotteryResult = z.infer<typeof insertLotteryResultSchema>;
export type LotteryResult = typeof lotteryResults.$inferSelect;

export type InsertLotteryHistory = z.infer<typeof insertLotteryHistorySchema>;
export type LotteryHistory = typeof lotteryHistory.$inferSelect;

export type InsertNumberStats = z.infer<typeof insertNumberStatsSchema>;
export type NumberStats = typeof numberStats.$inferSelect;

// API Response Types
export type LiveResultResponse = {
  set: string;
  value: string;
  time: string;
  twod: string;
};

export type TodayResultResponse = {
  set: string;
  value: string;
  open_time: string;
  twod: string;
};

export type HistoryResponse = {
  date: string;
  results: TodayResultResponse[];
};
