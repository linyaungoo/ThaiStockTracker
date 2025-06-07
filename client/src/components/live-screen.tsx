import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function LiveScreen() {
  const [liveData, setLiveData] = useState<any>(null);
  const [resultsData, setResultsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveRes, resultsRes] = await Promise.all([
          fetch("/api/lottery/live"),
          fetch("/api/lottery/results")
        ]);
        
        const live = await liveRes.json();
        const results = await resultsRes.json();
        
        setLiveData(live);
        setResultsData(results);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const liveResult = liveData?.live;
  const todayResults = resultsData?.result || [];

  return (
    <div className="space-y-6">
      {/* Current Live Result */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white mx-4 my-4 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Current Set</h2>
          <div className="text-4xl font-bold mb-2">
            {liveResult?.set || "----"}
          </div>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span>Value: <span className="font-semibold">{liveResult?.value || "----"}</span></span>
            <span>2D: <span className="font-semibold text-yellow-300">{liveResult?.twod || "--"}</span></span>
          </div>
          <div className="text-xs mt-2 opacity-90">
            Last updated: {liveResult?.time || "--:--:--"}
          </div>
        </div>
      </div>

      {/* Today's Results */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <span className="text-blue-500 mr-2">📅</span>
          Today's Results
        </h3>
        
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index: number) => {
            const drawTimes = ["11:00", "12:01", "15:00", "16:30"];
            const drawLabels = ["Morning Draw", "Noon Draw", "Afternoon Draw", "Evening Draw"];
            const displayTimes = ["11:00 AM", "12:01 PM", "3:00 PM", "4:30 PM"];
            const currentTime = displayTimes[index];
            const currentLabel = drawLabels[index];
            const timeColors = ["bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-purple-500"];
            const timeColor = timeColors[index];
            const result = todayResults[index];
            
            return (
              <Card key={index} className="border border-gray-100 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${timeColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {currentTime.split(':')[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {currentTime}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {currentLabel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {result ? (
                        <>
                          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {result.twod || "--"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Set: {result.set || ""}
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-medium text-gray-400">Pending...</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-20">
        <Card className="border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Stats</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {todayResults[0]?.twod || '--'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Latest 2D</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {todayResults.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Results Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {liveResult?.set?.slice(-2) || '--'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Live Set</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
