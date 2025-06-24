import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LiveScreen from "../components/live-screen";
import HistoryScreen from "../components/history-screen";
import DateHistoryScreen from "../components/date-history-screen";
import SearchScreen from "../components/search-screen";
import BottomNavigation from "../components/bottom-navigation";
import { lotteryApi } from "../lib/lottery-api";

type Screen = "live" | "history" | "date-history" | "search";

export default function ThaiLotteryApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("live");

  // Fetch live lottery data from API
  const { data: liveData, isLoading: isLiveLoading, error: liveError } = useQuery({
    queryKey: ['/api/lottery/live'],
    queryFn: () => lotteryApi.getLiveResults(),
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  // Fetch today's results
  const { data: todayResults, isLoading: isResultsLoading } = useQuery({
    queryKey: ['/api/lottery/results'],
    queryFn: () => lotteryApi.getTodayResults(),
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });

  const renderScreen = () => {
    switch (activeScreen) {
      case "live":
        return (
          <LiveScreen 
            liveResult={liveData?.live} 
            todayResults={todayResults?.result || liveData?.result} 
            isLoading={isLiveLoading || isResultsLoading}
            error={liveError}
          />
        );
      case "history":
        return <DateHistoryScreen />;
      case "search":
        return <SearchScreen />;
      default:
        return (
          <LiveScreen 
            liveResult={liveData?.live} 
            todayResults={todayResults?.result || liveData?.result} 
            isLoading={isLiveLoading || isResultsLoading}
            error={liveError}
          />
        );
    }
  };

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
