import { useState, useEffect } from "react";

export default function SimpleLiveScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/lottery/live");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-blue-500 text-white p-6 rounded-lg mb-4">
        <h1 className="text-xl font-bold mb-2">Thai Lottery Live</h1>
        <div className="text-lg">
          Set: {data?.live?.set || "Loading..."}
        </div>
        <div className="text-lg">
          Value: {data?.live?.value || "Loading..."}
        </div>
        <div className="text-lg">
          2D: {data?.live?.twod || "Loading..."}
        </div>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Today's Results</h2>
        {data?.result ? (
          data.result.map((result: any, index: number) => (
            <div key={index} className="flex justify-between py-2 border-b">
              <span>{result.open_time}</span>
              <span className="font-bold">{result.twod}</span>
            </div>
          ))
        ) : (
          <div>Loading results...</div>
        )}
      </div>
    </div>
  );
}