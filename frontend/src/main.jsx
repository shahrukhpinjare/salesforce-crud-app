import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// Global styles ko poore frontend app par apply karta hai.
import "./index.css";

// HTML ke root element mein React app mount karta hai; StrictMode development checks enable karta hai.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
