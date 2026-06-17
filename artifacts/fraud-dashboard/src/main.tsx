import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/api";
import { ErrorBoundary } from "./components/error-boundary";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
