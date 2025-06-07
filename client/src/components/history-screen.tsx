import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";

interface DateSection {
  date: string;
  results: Array<{ time: string; twod: string }>;
  isExpanded: boolean;
}

export default function HistoryScreen() {
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [dateSections, setDateSections] = useState<DateSection[]>([]);

  // Fetch recent history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/lottery/recent-history/10");
        const data = await response.json();
        setRecentHistory(data);
        
        if (data && Array.isArray(data)) {
          const sections = data.map((history: any) => ({
            date: history.date,
            results: Array.isArray(history.results) 
              ? history.results.map((result: any, index: number) => ({
                  time: ["11:00 AM", "12:01 PM", "3:00 PM", "4:30 PM"][index] || "Unknown",
                  twod: result.twod || result.set?.slice(-2) || "--"
                }))
              : [],
            isExpanded: false
          }));
          setDateSections(sections);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, []);

  const toggleDateSection = (index: number) => {
    setDateSections(prev => prev.map((section, i) => 
      i === index ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(recentHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thai-lottery-history.json';
    link.click();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">History</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportData}
          className="text-thai-blue border-thai-blue hover:bg-thai-blue hover:text-white"
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Trend Chart */}
      <Card className="border border-gray-100 dark:border-gray-700">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">7-Day Trend</h3>
          <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300">Chart visualization coming soon</span>
          </div>
        </CardContent>
      </Card>

      {/* Date Sections */}
      <div className="space-y-3 mb-20">
        {dateSections.map((section, index) => (
          <Card key={index} className="border border-gray-100 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => toggleDateSection(index)}
            >
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(section.date)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {section.results.length} draws completed
                </div>
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transform transition-transform ${
                  section.isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </Button>
            
            {section.isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-2">
                {section.results.map((result, resultIndex) => (
                  <div key={resultIndex} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{result.time}</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {result.twod}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {dateSections.length === 0 && (
          <Card className="border border-gray-100 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-sm">No historical data available</div>
                <div className="text-xs mt-1">Check back later for results</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
