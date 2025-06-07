import { Card, CardContent } from "@/components/ui/card";
import { useLotteryData } from "@/hooks/use-lottery-data";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function LiveScreen() {
  const { liveResult, todayResults, quickStats } = useLotteryData();

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-success" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-error" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getTimeColor = (time: string) => {
    if (!time) return "bg-purple-500";
    if (time.includes("11:00")) return "bg-thai-blue";
    if (time.includes("12:01")) return "bg-thai-gold";
    if (time.includes("3:00")) return "bg-orange-500";
    return "bg-purple-500";
  };

  return (
    <div className="space-y-6">
      {/* Current Live Result */}
      <div className="p-6 bg-gradient-to-r from-thai-blue to-blue-600 text-white mx-4 my-4 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Current Set</h2>
          <div className="text-4xl font-bold number-display mb-2">
            {liveResult?.set || "----"}
          </div>
          <div className="flex justify-center items-center space-x-4 text-sm">
            <span>Value: <span className="font-semibold">{liveResult?.value || "----"}</span></span>
            <span>2D: <span className="font-semibold text-thai-gold">{liveResult?.twod || "--"}</span></span>
          </div>
          <div className="text-xs mt-2 opacity-90">
            Last updated: {liveResult?.time ? new Date(liveResult.time).toLocaleTimeString() : "--:--:--"}
          </div>
        </div>
      </div>

      {/* Today's Results */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <span className="text-thai-blue mr-2">📅</span>
          Today's Results
        </h3>
        
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => {
            const drawTimes = ["11:00 AM", "12:01 PM", "3:00 PM", "4:30 PM"];
            const drawLabels = ["Morning Draw", "Noon Draw", "Afternoon Draw", "Evening Draw"];
            const currentTime = drawTimes[index];
            const currentLabel = drawLabels[index];
            const timeColor = getTimeColor(currentTime);
            const result = todayResults?.[index];
            
            return (
              <Card key={index} className="border border-gray-100 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${timeColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {currentTime?.split(':')[0] || "--"}
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
                          <div className="text-2xl font-bold number-display text-gray-800 dark:text-gray-200">
                            {result.twod}
                          </div>
                          <div className="flex items-center justify-end space-x-1">
                            {getChangeIcon(Math.random() * 10 - 5)}
                            <span className="text-xs text-gray-500">
                              {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 5)}
                            </span>
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
                <div className="text-2xl font-bold text-success">
                  {quickStats?.mostFrequent || '--'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Most Frequent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-thai-blue">
                  {liveResult?.twod || '--'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Latest 2D</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">
                  {quickStats?.streak || '0'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
