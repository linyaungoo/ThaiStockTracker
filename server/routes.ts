import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLotteryResultSchema, insertLotteryHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thai Lottery API proxy endpoints
  
  // Get live results
  app.get("/api/lottery/live", async (req, res) => {
    try {
      const response = await fetch("https://api.thaistock2d.com/live");
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      
      // Store in local storage for caching
      if (data.set && data.value && data.twod) {
        await storage.createLotteryResult({
          date: new Date().toISOString().split('T')[0],
          time: data.time || new Date().toISOString(),
          set: data.set,
          value: data.value,
          twod: data.twod,
          openTime: data.time || new Date().toISOString(),
        });
      }
      
      res.json(data);
    } catch (error) {
      // Return cached data if API fails
      const latest = await storage.getLatestLotteryResult();
      if (latest) {
        res.json({
          set: latest.set,
          value: latest.value,
          time: latest.time,
          twod: latest.twod
        });
      } else {
        res.status(500).json({ error: "Failed to fetch live results and no cached data available" });
      }
    }
  });

  // Get today's results
  app.get("/api/lottery/results", async (req, res) => {
    try {
      const response = await fetch("https://api.thaistock2d.com/2d_result");
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      
      // Store results and update number stats
      const results = data.result || data;
      if (Array.isArray(results)) {
        for (const result of results) {
          if (result.set && result.value && result.twod) {
            await storage.createLotteryResult({
              date: result.stock_date || new Date().toISOString().split('T')[0],
              time: result.open_time || new Date().toISOString(),
              set: result.set,
              value: result.value,
              twod: result.twod,
              openTime: result.open_time || new Date().toISOString(),
            });

            // Update number statistics
            const existingStats = await storage.getNumberStats(result.twod);
            if (existingStats) {
              await storage.updateNumberStats({
                number: result.twod,
                occurrences: (existingStats.occurrences || 0) + 1,
                lastSeen: new Date(),
                frequency: `${((existingStats.occurrences || 0) + 1) * 0.85}%`
              });
            } else {
              await storage.updateNumberStats({
                number: result.twod,
                occurrences: 1,
                lastSeen: new Date(),
                frequency: "0.85%"
              });
            }
          }
        }
      }
      
      res.json(data);
    } catch (error) {
      // Return cached data if API fails
      const today = new Date().toISOString().split('T')[0];
      const cachedResults = await storage.getLotteryResultsByDate(today);
      if (cachedResults.length > 0) {
        res.json({ 
          result: cachedResults.map(result => ({
            set: result.set,
            value: result.value,
            open_time: result.openTime,
            twod: result.twod
          }))
        });
      } else {
        res.status(500).json({ error: "Failed to fetch results and no cached data available" });
      }
    }
  });

  // Get history for specific date
  app.get("/api/lottery/history/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const response = await fetch(`https://api.thaistock2d.com/history?date=${date}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      
      // Store history
      await storage.createLotteryHistory({
        date,
        results: data
      });
      
      res.json(data);
    } catch (error) {
      // Return cached data if API fails
      const cachedHistory = await storage.getLotteryHistoryByDate(req.params.date);
      if (cachedHistory) {
        res.json(cachedHistory.results);
      } else {
        res.status(500).json({ error: "Failed to fetch history and no cached data available" });
      }
    }
  });

  // Get recent history (last N days)
  app.get("/api/lottery/recent-history/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days) || 10;
      const recentHistory = await storage.getRecentLotteryHistory(days);
      res.json(recentHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent history" });
    }
  });

  // Get number statistics
  app.get("/api/lottery/stats/:number", async (req, res) => {
    try {
      const { number } = req.params;
      const stats = await storage.getNumberStats(number);
      if (stats) {
        res.json(stats);
      } else {
        res.json({
          number,
          occurrences: 0,
          frequency: "0%",
          lastSeen: null
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch number statistics" });
    }
  });

  // Get most frequent numbers
  app.get("/api/lottery/popular-numbers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const popularNumbers = await storage.getMostFrequentNumbers(limit);
      res.json(popularNumbers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular numbers" });
    }
  });

  // Get all number statistics
  app.get("/api/lottery/all-stats", async (req, res) => {
    try {
      const allStats = await storage.getAllNumberStats();
      res.json(allStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch all statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
