import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./ErrorBoundary.tsx";
import "./index.css";

// Restore theme from local storage before rendering to avoid flicker.
const sessionData = localStorage.getItem("sr_sessions");
if (sessionData) {
  try {
    const session = JSON.parse(sessionData);
    const userId = session.userId;
    const savedTheme = localStorage.getItem(`theme_${userId}`);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
