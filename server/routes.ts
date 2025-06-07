import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic } from "./vite";
import { storage } from "./storage";
import { insertLotteryResultSchema, insertLotteryHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thai Lottery API proxy endpoints
  
  // Get live results and today's results combined
  app.get("/api/lottery/live", async (req, res) => {
    try {
      // Fetch from the actual Thai lottery API endpoints
      const [liveResponse, resultResponse] = await Promise.all([
        fetch("https://thaistock2d.com/live", {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
          }
        }),
        fetch("https://thaistock2d.com/result", {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
          }
        })
      ]);

      let liveData = null;
      let resultData = [];

      // Process live data
      if (liveResponse.ok) {
        liveData = await liveResponse.json();
      }

      // Process today's results
      if (resultResponse.ok) {
        const results = await resultResponse.json();
        resultData = Array.isArray(results) ? results : (results.result || []);
      }

      // Store live result if available
      if (liveData && liveData.set && liveData.value && liveData.twod) {
        try {
          await storage.createLotteryResult({
            date: new Date().toISOString().split('T')[0],
            time: liveData.time || new Date().toISOString(),
            set: liveData.set,
            value: liveData.value,
            twod: liveData.twod,
            openTime: liveData.time || new Date().toISOString(),
          });
        } catch (storageError) {
          console.error("Storage error:", storageError);
        }
      }

      res.json({
        live: liveData,
        result: resultData
      });

    } catch (error) {
      console.error("API Error:", error);
      
      // Try to get cached data
      try {
        const latest = await storage.getLatestLotteryResult();
        const today = new Date().toISOString().split('T')[0];
        const cachedResults = await storage.getLotteryResultsByDate(today);
        
        res.json({
          live: latest ? {
            set: latest.set,
            value: latest.value,
            time: latest.time,
            twod: latest.twod
          } : null,
          result: cachedResults.map(result => ({
            set: result.set,
            value: result.value,
            open_time: result.openTime,
            twod: result.twod
          })),
          cached: true
        });
      } catch (cacheError) {
        res.status(500).json({ 
          error: "Failed to fetch lottery data",
          message: "Unable to connect to lottery service"
        });
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

  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}
