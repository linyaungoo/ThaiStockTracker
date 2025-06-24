import { useState, useEffect } from "react";

interface LiveResult {
  set: string;
  value: string;
  time: string;
  twod: string;
}

interface TodayResult {
  set: string;
  value: string;
  open_time: string;
  twod: string;
}

function App() {
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [todayResults, setTodayResults] = useState<TodayResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/lottery/live");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (data.live) setLiveResult(data.live);
      if (data.result) setTodayResults(data.result);
    } catch (error) {
      console.error('API fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Thai2Dapp</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Live Thai Lottery Results</p>
      </div>

      {/* Live Result Card */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', margin: '16px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Live Result</h2>
          <button onClick={fetchData} disabled={isLoading} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {isLoading ? '⟳' : '↻'} Refresh
          </button>
        </div>
        
        {liveResult ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Set</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{liveResult.set}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Value</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{liveResult.value}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>2D Number</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>{liveResult.twod}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Time</p>
              <p style={{ margin: 0, fontSize: '16px' }}>{liveResult.time?.split('T')[1]?.split('.')[0] || liveResult.time}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ margin: 0, opacity: 0.8 }}>Loading live results...</p>
          </div>
        )}
      </div>

      {/* Today's Results */}
      <div style={{ background: '#f8fafc', margin: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Today's Results</h3>
        {todayResults.length > 0 ? (
          <div>
            {todayResults.map((result, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{result.open_time}</div>
                  <div style={{ fontSize: '14px', color: '#374151' }}>Set: {result.set}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{result.twod}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Value: {result.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, textAlign: 'center', color: '#6b7280' }}>Loading today's results...</p>
        )}
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          {isLoading ? 'Fetching latest data...' : 'Auto-refresh every 30 minutes'}
        </p>
      </div>
    </div>
  );
}

export default App;
