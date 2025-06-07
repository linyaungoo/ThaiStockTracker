import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, TrendingUp } from "lucide-react";

type Screen = "live" | "history" | "search";

interface LiveResult {
  set: string;
  value: string;
  time: string;
  twod: string;
}

interface TodayResult {
  set: string;
  value: string;
  open_time: string;
  twod: string;
}

export default function ThaiLotteryApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("live");
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [todayResults, setTodayResults] = useState<TodayResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLiveData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/lottery/live");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.live) {
        setLiveResult(data.live);
      }
      
      if (data.result && Array.isArray(data.result)) {
        setTodayResults(data.result);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch lottery data:", error);
      // Keep existing data on error instead of clearing it
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.split('T')[1]?.split('.')[0] || timeString;
  };

  const renderLiveScreen = () => (
    <div className="p-4 space-y-4">
      {/* Live Result Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Live Result</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLiveData}
              disabled={isLoading}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {liveResult ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Set</p>
                <p className="text-2xl font-bold">{liveResult.set}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Value</p>
                <p className="text-2xl font-bold">{liveResult.value}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">2D Number</p>
                <p className="text-3xl font-bold text-yellow-300">{liveResult.twod}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Time</p>
                <p className="text-lg">{formatTime(liveResult.time)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-blue-100">Loading live results...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Results */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Today's Results
          </h3>
          
          {todayResults.length > 0 ? (
            <div className="space-y-2">
              {todayResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {result.open_time}
                    </Badge>
                    <p className="text-sm text-gray-600">Set: {result.set}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{result.twod}</p>
                    <p className="text-xs text-gray-500">Value: {result.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No results available</p>
          )}
        </CardContent>
      </Card>

      {lastUpdate && (
        <p className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );

  const renderHistoryScreen = () => (
    <div className="p-4">
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">History</h3>
          <p className="text-gray-600 mb-4">View historical lottery results and patterns</p>
          <Button variant="outline">Coming Soon</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSearchScreen = () => (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Number Search</h3>
          <input
            type="text"
            placeholder="Enter 2D number (00-99)"
            className="w-full p-3 border rounded-lg mb-4"
            maxLength={2}
          />
          <Button className="w-full">Search Number Statistics</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
        <h1 className="text-xl font-bold">Thai2Dapp</h1>
        <p className="text-blue-100 text-sm">Live Thai Lottery Results</p>
      </header>

      {/* Screen Content */}
      <div className="pb-20">
        {activeScreen === "live" && renderLiveScreen()}
        {activeScreen === "history" && renderHistoryScreen()}
        {activeScreen === "search" && renderSearchScreen()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t shadow-lg">
        <div className="flex">
          {[
            { key: "live", label: "Live", icon: "🔴" },
            { key: "history", label: "History", icon: "📊" },
            { key: "search", label: "Search", icon: "🔍" }
          ].map((item) => (
            <button
              key={item.key}
              className={`flex-1 py-3 px-4 text-center ${
                activeScreen === item.key 
                  ? 'bg-blue-50 text-blue-600 border-t-2 border-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              onClick={() => setActiveScreen(item.key as Screen)}
            >
              <div className="text-lg">{item.icon}</div>
              <div className="text-xs font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
