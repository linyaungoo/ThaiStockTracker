import { Button } from "@/components/ui/button";
import { Radio, History, Search } from "lucide-react";

type Screen = "live" | "history" | "search";

interface BottomNavigationProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export default function BottomNavigation({ activeScreen, onScreenChange }: BottomNavigationProps) {
  const tabs = [
    { id: "live" as Screen, label: "Live", icon: Radio },
    { id: "history" as Screen, label: "History", icon: History },
    { id: "search" as Screen, label: "Search", icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 py-3 px-4 text-center h-auto flex flex-col items-center space-y-1 rounded-none ${
                isActive 
                  ? 'text-thai-blue bg-blue-50 dark:bg-blue-950/30' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              onClick={() => onScreenChange(tab.id)}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-thai-blue' : ''}`} />
              <span className={`text-xs font-medium ${
                isActive ? 'text-thai-blue' : ''
              }`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
