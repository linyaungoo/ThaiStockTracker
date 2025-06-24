import { createRoot } from "react-dom/client";
import "./index.css";

const App = () => {
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
          <button style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Set</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>1,100.01</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Value</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>52,840.03</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>2D Number</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>10</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '14px' }}>Time</p>
            <p style={{ margin: 0, fontSize: '16px' }}>16:31:58</p>
          </div>
        </div>
      </div>

      {/* Today's Results */}
      <div style={{ background: '#f8fafc', margin: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Today's Results</h3>
        <div>
          {[
            { time: "11:00:00", set: "1,091.08", twod: "81", value: "24,231.22" },
            { time: "12:01:00", set: "1,086.32", twod: "24", value: "29,794.02" },
            { time: "15:00:00", set: "1,090.99", twod: "94", value: "41,344.58" },
            { time: "16:30:00", set: "1,100.01", twod: "10", value: "52,840.03" }
          ].map((result, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{result.time}</div>
                <div style={{ fontSize: '14px', color: '#374151' }}>Set: {result.set}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{result.twod}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Value: {result.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          UI Demo - No live data connection
        </p>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
