import { useMemo } from "react";

interface LotteryChartProps {
  data: Array<{
    date: string;
    results: any;
  }>;
}

export default function LotteryChart({ data }: LotteryChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.slice(0, 7).reverse().map((item) => {
      let average = 50; // Default value
      
      if (Array.isArray(item.results)) {
        const numbers = item.results
          .map((result: any) => parseInt(result.twod || result.set?.slice(-2) || "50"))
          .filter(num => !isNaN(num));
        
        if (numbers.length > 0) {
          average = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        }
      }
      
      return {
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(average)
      };
    });
  }, [data]);

  const maxValue = Math.max(...chartData.map(d => d.value), 0);
  const minValue = Math.min(...chartData.map(d => d.value), 100);

  if (chartData.length === 0) {
    return (
      <div className="chart-container rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-sm">Interactive Chart</div>
          <div className="text-xs">7-day trend visualization</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container rounded-lg p-4 relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 300 160" className="absolute inset-0">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="40"
            y1={20 + i * 25}
            x2="280"
            y2={20 + i * 25}
            stroke="#e5e7eb"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(i => {
          const value = Math.round(maxValue - (i * (maxValue - minValue) / 4));
          return (
            <text
              key={i}
              x="35"
              y={25 + i * 25}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {value}
            </text>
          );
        })}
        
        {/* Chart line */}
        {chartData.length > 1 && (
          <polyline
            points={chartData.map((d, i) => {
              const x = 50 + (i * 200 / (chartData.length - 1));
              const y = 20 + ((maxValue - d.value) / (maxValue - minValue)) * 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="hsl(207, 90%, 54%)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        
        {/* Data points */}
        {chartData.map((d, i) => {
          const x = 50 + (i * 200 / (chartData.length - 1));
          const y = 20 + ((maxValue - d.value) / (maxValue - minValue)) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="hsl(207, 90%, 54%)"
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        
        {/* X-axis labels */}
        {chartData.map((d, i) => {
          const x = 50 + (i * 200 / (chartData.length - 1));
          return (
            <text
              key={i}
              x={x}
              y="150"
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {d.date}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
