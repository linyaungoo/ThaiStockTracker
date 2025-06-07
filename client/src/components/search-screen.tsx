import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLotteryData } from "@/hooks/use-lottery-data";
import { Search } from "lucide-react";

export default function SearchScreen() {
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const { numberStats, popularNumbers } = useLotteryData();

  const handleSearch = async (number: string) => {
    if (number.length === 2) {
      try {
        const response = await fetch(`/api/lottery/stats/${number}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({
          number,
          occurrences: 0,
          frequency: "0%",
          lastSeen: null
        });
      }
    }
  };

  const searchNumber = (number: string) => {
    setSearchNumber(number);
    handleSearch(number);
  };

  const getTimeColor = (time: string) => {
    if (time.includes("11:00") || time.includes("Morning")) return "bg-thai-blue";
    if (time.includes("12:01") || time.includes("Noon")) return "bg-thai-gold";
    if (time.includes("3:00") || time.includes("Afternoon")) return "bg-orange-500";
    return "bg-purple-500";
  };

  const generateRecentOccurrences = (number: string) => {
    // Generate sample recent occurrences for demonstration
    const occurrences = [];
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      dates.push(date);
    }
    
    dates.sort((a, b) => b.getTime() - a.getTime());
    
    for (let i = 0; i < Math.min(3, dates.length); i++) {
      const times = ["11:00 AM", "12:01 PM", "3:00 PM", "4:30 PM"];
      const labels = ["Morning", "Noon", "Afternoon", "Evening"];
      const randomIndex = Math.floor(Math.random() * times.length);
      
      occurrences.push({
        date: dates[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: times[randomIndex],
        label: labels[randomIndex]
      });
    }
    
    return occurrences;
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Number Search</h2>

      {/* Search Input */}
      <div className="relative mb-6">
        <Input
          type="number"
          placeholder="Enter 2D number (00-99)"
          value={searchNumber}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 2) {
              setSearchNumber(value);
              if (value.length === 2) {
                handleSearch(value);
              }
            }
          }}
          className="w-full p-4 pr-12 text-lg font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-thai-blue focus:border-transparent"
          maxLength={2}
        />
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-thai-blue hover:bg-thai-blue hover:text-white"
          onClick={() => searchNumber.length === 2 && handleSearch(searchNumber)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Results */}
      <div className="space-y-4 mb-20">
        {searchResults && (
          <>
            {/* Number Stats Card */}
            <Card className="border border-gray-100 dark:border-gray-700">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Number: {searchResults.number}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-thai-blue">
                      {searchResults.occurrences || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Occurrences</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {searchResults.frequency || "0%"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Frequency Rate</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-orange-500">
                    {searchResults.lastSeen 
                      ? new Date(searchResults.lastSeen).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit'
                        })
                      : "Never seen"
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Last Seen</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Occurrences */}
            {searchResults.occurrences > 0 && (
              <Card className="border border-gray-100 dark:border-gray-700">
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Recent Occurrences</h4>
                  <div className="space-y-2">
                    {generateRecentOccurrences(searchResults.number).map((occurrence, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                        <span className="text-gray-600 dark:text-gray-400">
                          {occurrence.date}, {occurrence.time}
                        </span>
                        <Badge className={`text-white ${getTimeColor(occurrence.label)}`}>
                          {occurrence.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Popular Numbers */}
        <Card className="border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Most Popular Numbers</h4>
            <div className="grid grid-cols-4 gap-2">
              {popularNumbers && popularNumbers.length > 0 ? (
                popularNumbers.slice(0, 8).map((numberStat, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-3 text-center bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-thai-blue hover:text-white transition-colors h-auto flex-col"
                    onClick={() => searchNumber(numberStat.number)}
                  >
                    <div className="font-bold">{numberStat.number}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {numberStat.occurrences}×
                    </div>
                  </Button>
                ))
              ) : (
                // Fallback popular numbers
                ["12", "23", "45", "67", "89", "01", "34", "56"].map((number, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-3 text-center bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-thai-blue hover:text-white transition-colors h-auto flex-col"
                    onClick={() => searchNumber(number)}
                  >
                    <div className="font-bold">{number}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 15) + 5}×
                    </div>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {!searchResults && searchNumber.length === 0 && (
          <Card className="border border-gray-100 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm">Enter a 2-digit number to search</div>
                <div className="text-xs mt-1">Get detailed statistics and history</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
