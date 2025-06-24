import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { lotteryApi } from "../lib/lottery-api";

interface HistoryResult {
  time: string;
  open_time: string;
  twod: string;
  set: string;
  value: string;
}

export default function DateHistoryScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Fetch history data for selected date
  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['/api/lottery/history', selectedDate],
    queryFn: () => lotteryApi.getHistoryByDate(selectedDate),
    enabled: !!selectedDate,
  });

  // Fetch recent history for date list
  const { data: recentHistory } = useQuery({
    queryKey: ['/api/lottery/recent-history', 10],
    queryFn: () => lotteryApi.getRecentHistory(10),
  });

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const results: HistoryResult[] = historyData?.result || [];

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Lottery History</h2>
        <p className="text-gray-600 text-sm">View lottery results by date</p>
      </div>

      {/* Date Picker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            max={new Date().toISOString().split('T')[0]}
          />
          {selectedDate && (
            <p className="text-sm text-gray-600 mt-2">
              {formatDate(selectedDate)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results for Selected Date */}
      <Card>
        <CardHeader className="pb-2">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <CardTitle className="text-lg">
              Results for {selectedDate}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge variant="outline">
                  {results.length} results
                </Badge>
              )}
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading results...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-600">
                <p>Failed to load data for {selectedDate}</p>
                <p className="text-sm text-gray-500 mt-1">Please try another date</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm text-gray-600">
                        {result.open_time || result.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        Set: {result.set}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.twod}
                      </div>
                      <div className="text-xs text-gray-500">
                        Value: {result.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No lottery results found for {selectedDate}</p>
                <p className="text-sm mt-1">Try selecting a different date</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quick Date Selection */}
      {recentHistory && recentHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {recentHistory.slice(0, 6).map((history, index) => (
                <Button
                  key={index}
                  variant={selectedDate === history.date ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(history.date)}
                  className="text-xs"
                >
                  {new Date(history.date).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}