import { ErrorBoundary } from "@/components/error-boundary";
import ThaiLotteryMinimal from "@/components/thai-lottery-minimal";

function App() {
  return (
    <ErrorBoundary>
      <ThaiLotteryMinimal />
    </ErrorBoundary>
  );
}

export default App;
