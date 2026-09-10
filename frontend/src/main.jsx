import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import PWAProvider from "./components/PWAProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PWAProvider>
      <App />
    </PWAProvider>
  </React.StrictMode>,
);
