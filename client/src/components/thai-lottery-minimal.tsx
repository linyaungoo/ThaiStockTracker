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

export default function ThaiLotteryMinimal() {
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [todayResults, setTodayResults] = useState<TodayResult[]>([]);
  const [activeTab, setActiveTab] = useState<"live" | "history" | "search">("live");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lottery/live");
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.live) {
        setLiveResult(data.live);
      }
      
      if (data.result && Array.isArray(data.result)) {
        setTodayResults(data.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const styles = {
    container: {
      maxWidth: '480px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: 'white',
      padding: '20px',
      textAlign: 'center' as const
    },
    liveCard: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: 'white',
      margin: '16px',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    resultCard: {
      backgroundColor: '#f8fafc',
      margin: '16px',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    resultItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: 'white',
      marginBottom: '8px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    nav: {
      position: 'fixed' as const,
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      backgroundColor: 'white',
      borderTop: '1px solid #e2e8f0',
      display: 'flex'
    },
    navItem: {
      flex: 1,
      padding: '12px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      borderBottom: '2px solid transparent'
    },
    activeNavItem: {
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
      borderBottomColor: '#3b82f6'
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Thai2Dapp</h1>
          <p>Thai Lottery Results</p>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</p>
          <button style={styles.button} onClick={fetchData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Thai2Dapp</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Live Thai Lottery Results</p>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: '80px' }}>
        {activeTab === "live" && (
          <>
            {/* Live Result */}
            <div style={styles.liveCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Live Result</h2>
                <button 
                  style={{ ...styles.button, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  onClick={fetchData}
                  disabled={isLoading}
                >
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
                    <p style={{ margin: 0, fontSize: '16px' }}>{liveResult.time}</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ margin: 0, opacity: 0.8 }}>Loading live results...</p>
                </div>
              )}
            </div>

            {/* Today's Results */}
            <div style={styles.resultCard}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Today's Results</h3>
              {todayResults.length > 0 ? (
                <div>
                  {todayResults.map((result, index) => (
                    <div key={index} style={styles.resultItem}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                          {result.open_time}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>
                          Set: {result.set}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                          {result.twod}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Value: {result.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, textAlign: 'center', color: '#6b7280' }}>No results available</p>
              )}
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div style={styles.resultCard}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>History</h3>
            <p style={{ margin: 0, textAlign: 'center', color: '#6b7280' }}>Historical data coming soon</p>
          </div>
        )}

        {activeTab === "search" && (
          <div style={styles.resultCard}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Number Search</h3>
            <input
              type="text"
              placeholder="Enter 2D number (00-99)"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                marginBottom: '12px'
              }}
              maxLength={2}
            />
            <button style={{ ...styles.button, width: '100%' }}>
              Search Statistics
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.nav}>
        {[
          { key: "live", label: "Live", icon: "🔴" },
          { key: "history", label: "History", icon: "📊" },
          { key: "search", label: "Search", icon: "🔍" }
        ].map((item) => (
          <div
            key={item.key}
            style={{
              ...styles.navItem,
              ...(activeTab === item.key ? styles.activeNavItem : {})
            }}
            onClick={() => setActiveTab(item.key as "live" | "history" | "search")}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}