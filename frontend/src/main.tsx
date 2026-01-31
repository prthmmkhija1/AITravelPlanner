import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { LanguageProvider } from "./i18n";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </LanguageProvider>
  </React.StrictMode>
);

