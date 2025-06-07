import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useLotteryData } from "@/hooks/use-lottery-data";
import LiveScreen from "@/components/live-screen";
import HistoryScreen from "@/components/history-screen";
import SearchScreen from "@/components/search-screen";
import BottomNavigation from "@/components/bottom-navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { Wifi, WifiOff, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Screen = "live" | "history" | "search";

export default function ThaiLotteryApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>("live");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { isLoading } = useLotteryData();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen shadow-lg relative dark:bg-gray-900">
      {/* Header */}
      <header className="gradient-bg text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-thai-gold text-2xl font-bold">🎲</div>
            <h1 className="text-xl font-bold">Thai2Dapp</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full animate-pulse-slow ${
                isOnline ? 'bg-success' : 'bg-error'
              }`} />
              <span className="text-xs">{isOnline ? 'Live' : 'Offline'}</span>
            </div>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-error text-white px-4 py-2 text-sm flex items-center justify-center">
          <WifiOff className="h-4 w-4 mr-2" />
          You're offline. Showing cached data.
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thai-blue"></div>
            <span className="text-gray-700 dark:text-gray-300">Updating results...</span>
          </Card>
        </div>
      )}

      {/* Screen Content */}
      <div className="pb-20">
        <ErrorBoundary>
          {activeScreen === "live" && <LiveScreen />}
          {activeScreen === "history" && <HistoryScreen />}
          {activeScreen === "search" && <SearchScreen />}
        </ErrorBoundary>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
}
