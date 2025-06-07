import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error boundary at the root level
try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Thai2Dapp - Loading Error</h1>
      <p>Unable to initialize the application. Please refresh the page.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px;">
        Refresh
      </button>
    </div>
  `;
}
